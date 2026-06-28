import { ChunkRepository } from "../chunk/chunk.repository.js";
import { EmbeddingRepository } from "./embedding.repository.js";
import { EmbeddingCacheRepository } from "./embedding-cache.repository.js";
import { env } from "../../config/env.js";
import { GoogleGenAI } from "@google/genai";
import { generateHash } from "../../shared/utils/hash.js";
import { EmbeddingStatus } from "./embedding.types.js";
import { cache, cacheKeys } from "../../shared/redis/redis.js";
import { Chunk, ChunkType } from "../chunk/chunk.types.js";

const MAX_EMBED_CHARS = 8_000;

const EMBEDDABLE_TYPES = new Set([
  ChunkType.FUNCTION,
  ChunkType.COMPONENT,
  ChunkType.METHOD,
]);

const TYPE_PRIORITY: Record<string, number> = {
  [ChunkType.COMPONENT]: 0,
  [ChunkType.FUNCTION]: 1,
  [ChunkType.METHOD]: 2,
};

function isRateLimitError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /429|quota|rate.?limit|resource.?exhausted|too many requests/i.test(
    message,
  );
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
) {
  let index = 0;
  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (index < items.length) {
        const current = items[index];
        index += 1;
        await worker(current);
      }
    },
  );
  await Promise.all(runners);
}

export class EmbeddingService {
  private readonly chunkRepository = new ChunkRepository();
  private readonly embeddingRepository = new EmbeddingRepository();
  private readonly embeddingCacheRepository = new EmbeddingCacheRepository();
  private readonly genAI = new GoogleGenAI({ apiKey: env.geminiApiKey });
  private readonly inFlightEmbeddings = new Map<string, Promise<number[]>>();
  private lastRequestAt = 0;
  private apiCallsThisRun = 0;

  private truncateForEmbedding(content: string) {
    if (content.length <= MAX_EMBED_CHARS) return content;
    return content.slice(0, MAX_EMBED_CHARS);
  }

  private getEmbedContent(chunk: Chunk): string {
    return this.truncateForEmbedding(chunk.content).trim();
  }

  private shouldEmbedChunk(chunk: Chunk): boolean {
    if (!EMBEDDABLE_TYPES.has(chunk.type)) return false;
    return this.getEmbedContent(chunk).length >= env.embeddingMinChars;
  }

  private prioritizeChunks(chunks: Chunk[]): Chunk[] {
    const embeddable = chunks.filter((chunk) => this.shouldEmbedChunk(chunk));

    embeddable.sort((a, b) => {
      const priorityDiff =
        (TYPE_PRIORITY[a.type] ?? 99) - (TYPE_PRIORITY[b.type] ?? 99);
      if (priorityDiff !== 0) return priorityDiff;
      return b.content.length - a.content.length;
    });

    if (embeddable.length <= env.embeddingMaxChunks) {
      return embeddable;
    }

    console.warn(
      `[embeddings] Capping ${embeddable.length} chunks to ${env.embeddingMaxChunks} for workspace quota protection`,
    );
    return embeddable.slice(0, env.embeddingMaxChunks);
  }

  private async throttleRequest() {
    const waitMs =
      this.lastRequestAt + env.embeddingRequestDelayMs - Date.now();
    if (waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
    this.lastRequestAt = Date.now();
  }

  private async callEmbeddingApi(content: string): Promise<number[]> {
    await this.throttleRequest();

    const result = await this.genAI.models.embedContent({
      model: "gemini-embedding-001",
      contents: content,
    });

    this.apiCallsThisRun += 1;
    const embeddingValues = result.embeddings?.[0]?.values ?? null;
    if (!embeddingValues) {
      throw new Error("Failed to generate embedding");
    }
    return embeddingValues;
  }

  private async embedWithRetry(content: string): Promise<number[]> {
    try {
      return await this.callEmbeddingApi(content);
    } catch (error) {
      if (isRateLimitError(error)) {
        console.warn(
          "[embeddings] Rate limit hit — waiting 5s before one retry",
        );
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return await this.callEmbeddingApi(content);
      }
      throw error;
    }
  }

  private async resolveEmbeddingVector(
    contentHash: string,
    content: string,
    memoryCache: Map<string, number[]>,
  ): Promise<{ vector: number[]; fromApi: boolean }> {
    if (memoryCache.has(contentHash)) {
      return { vector: memoryCache.get(contentHash)!, fromApi: false };
    }

    const mongoCached =
      await this.embeddingCacheRepository.findByHash(contentHash);
    if (mongoCached?.embedding?.length) {
      memoryCache.set(contentHash, mongoCached.embedding);
      await cache.setJson(
        cacheKeys.embedding(contentHash),
        mongoCached.embedding,
        60 * 60 * 24 * 30,
      );
      return { vector: mongoCached.embedding, fromApi: false };
    }

    const redisCached = await cache.getJson<number[]>(
      cacheKeys.embedding(contentHash),
    );
    if (redisCached?.length) {
      memoryCache.set(contentHash, redisCached);
      await this.embeddingCacheRepository
        .upsert(contentHash, redisCached)
        .catch(() => undefined);
      return { vector: redisCached, fromApi: false };
    }

    const inFlight = this.inFlightEmbeddings.get(contentHash);
    if (inFlight) {
      const vector = await inFlight;
      return { vector, fromApi: false };
    }

    const promise = this.embedWithRetry(content).then(async (vector) => {
      memoryCache.set(contentHash, vector);
      await Promise.all([
        this.embeddingCacheRepository.upsert(contentHash, vector),
        cache.setJson(cacheKeys.embedding(contentHash), vector, 60 * 60 * 24 * 30),
      ]);
      return vector;
    }).finally(() => {
      this.inFlightEmbeddings.delete(contentHash);
    });

    this.inFlightEmbeddings.set(contentHash, promise);
    const vector = await promise;
    return { vector, fromApi: true };
  }

  async generateWorkspaceEmbeddings(workspaceId: string) {
    if (env.skipEmbeddings) {
      console.log("[embeddings] Skipped — SKIP_EMBEDDINGS=true");
      return {
        embeddingsCreated: 0,
        embeddingsReused: 0,
        embeddingsSkipped: 0,
        apiCalls: 0,
      };
    }

    this.apiCallsThisRun = 0;
    const allChunks = await this.chunkRepository.findByWorkspace(workspaceId);
    const targetChunks = this.prioritizeChunks(allChunks);
    const getChunkId = (chunk: Chunk & { _id?: { toString(): string } }) =>
      chunk._id?.toString() ?? `${chunk.filePath}:${chunk.type}:${chunk.name}`;
    const targetChunkIds = targetChunks.map((chunk) => getChunkId(chunk));

    const existingEmbeddings = await this.embeddingRepository.findByChunkIds(
      workspaceId,
      targetChunkIds,
    );
    const existingByChunkId = new Map(
      existingEmbeddings.map((entry) => [entry.chunkId, entry]),
    );

    const uniqueHashes = [
      ...new Set(
        targetChunks.map((chunk) =>
          generateHash(this.getEmbedContent(chunk)),
        ),
      ),
    ];
    const globalCacheEntries =
      await this.embeddingCacheRepository.findByHashes(uniqueHashes);
    const memoryCache = new Map<string, number[]>(
      globalCacheEntries.map((entry) => [entry.contentHash, entry.embedding]),
    );

    const embeddings: Array<{
      workspaceId: string;
      chunkId: string;
      filePath: string;
      content: string;
      contentHash: string;
      embedding: number[];
      status: EmbeddingStatus;
    }> = [];

    let reused = 0;
    let quotaExhausted = false;

    await runWithConcurrency(
      targetChunks,
      env.embeddingConcurrency,
      async (chunk) => {
        if (quotaExhausted) return;

        try {
          const content = this.getEmbedContent(chunk);
          const contentHash = generateHash(content);
          const chunkId = getChunkId(chunk);

          const { vector: embeddingValues, fromApi } =
            await this.resolveEmbeddingVector(
              contentHash,
              content,
              memoryCache,
            );

          if (!fromApi) {
            reused += 1;
          }

          embeddings.push({
            workspaceId,
            chunkId,
            filePath: chunk.filePath,
            content,
            contentHash,
            embedding: embeddingValues,
            status: EmbeddingStatus.READY,
          });
        } catch (error) {
          console.warn(`Embedding failed for chunk ${getChunkId(chunk)}:`, error);
          if (isRateLimitError(error)) {
            quotaExhausted = true;
            console.error(
              "[embeddings] Quota exhausted — stopping further API calls for this run",
            );
          }
        }
      },
    );

    await this.embeddingRepository.deleteOrphanedEmbeddings(
      workspaceId,
      targetChunkIds,
    );

    const toUpsert = embeddings.filter((entry) => {
      const existing = existingByChunkId.get(entry.chunkId);
      return !(
        existing &&
        existing.contentHash === entry.contentHash &&
        existing.embedding?.length
      );
    });

    if (toUpsert.length > 0) {
      await this.embeddingRepository.upsertMany(toUpsert);
    }

    const stats = {
      embeddingsCreated: embeddings.length,
      embeddingsReused: reused,
      embeddingsUncappedTotal: allChunks.filter((c) =>
        this.shouldEmbedChunk(c),
      ).length,
      apiCalls: this.apiCallsThisRun,
    };

    console.log("[embeddings] Workspace complete:", stats);
    return stats;
  }

  async embedQuery(query: string) {
    const normalized = query.trim();
    const queryHash = generateHash(normalized);
    const key = cacheKeys.queryEmbedding(queryHash);

    const cached = await cache.getJson<number[]>(key);
    if (cached?.length) return cached;

    const mongoCached =
      await this.embeddingCacheRepository.findByHash(queryHash);
    if (mongoCached?.embedding?.length) {
      await cache.setJson(key, mongoCached.embedding, 60 * 60);
      return mongoCached.embedding;
    }

    const embeddingValues = await this.embedWithRetry(normalized);
    await Promise.all([
      cache.setJson(key, embeddingValues, 60 * 60),
      this.embeddingCacheRepository.upsert(queryHash, embeddingValues),
    ]);
    return embeddingValues;
  }

  private cosineSimilarity(a: number[], b: number[]) {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async search(workspaceId: string, query: string, topK = 18) {
    const queryEmbedding = await this.embedQuery(query);
    const embeddings =
      await this.embeddingRepository.findByWorkspace(workspaceId);
    const scored = embeddings.map((embedding) => ({
      chunkId: embedding.chunkId,
      filePath: embedding.filePath,
      content: embedding.content,
      score: this.cosineSimilarity(queryEmbedding, embedding.embedding),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}
