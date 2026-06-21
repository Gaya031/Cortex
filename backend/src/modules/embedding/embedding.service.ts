import { ChunkRepository } from "../chunk/chunk.repository.js";
import { EmbeddingRepository } from "./embedding.repository.js";
import { env } from "../../config/env.js";
import { GoogleGenAI } from "@google/genai";
import { generateHash } from "../../shared/utils/hash.js";
import { EmbeddingStatus } from "./embedding.types.js";
import { cache, cacheKeys } from "../../shared/redis/redis.js";

export class EmbeddingService {
  private readonly chunkRepository = new ChunkRepository();
  private readonly embeddingRepository = new EmbeddingRepository();
  private readonly genAI = new GoogleGenAI({ apiKey: env.geminiApiKey });

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

  async generateWorkspaceEmbeddings(workspaceId: string) {
    const chunks = await this.chunkRepository.findByWorkspace(workspaceId);
    await this.embeddingRepository.deleteWorkspaceEmbeddings(workspaceId);

    const embeddings = [];

    for (const chunk of chunks) {
      const contentHash = generateHash(chunk.content);
      const key = cacheKeys.embedding(contentHash);
      let embeddingValues = await cache.getJson<number[]>(key);

      if (!embeddingValues) {
        const result = await this.genAI.models.embedContent({
          model: "gemini-embedding-001",
          contents: chunk.content,
        });

        embeddingValues = result.embeddings?.[0]?.values ?? null;

        if (!embeddingValues) {
          throw new Error(`Failed to generate embedding for chunk ${chunk._id}`);
        }

        await cache.setJson(key, embeddingValues, 60 * 60 * 24 * 7);
      }

      embeddings.push({
        workspaceId,
        chunkId: chunk._id.toString(),
        filePath: chunk.filePath,
        content: chunk.content,
        contentHash,
        embedding: embeddingValues,
        status: EmbeddingStatus.READY,
      });
    }
    if (embeddings.length > 0) {
      await this.embeddingRepository.createMany(embeddings);
    }
    return { embeddingsCreated: embeddings.length };
  }

  async embedQuery(query: string) {
    const key = cacheKeys.queryEmbedding(generateHash(query));
    const cached = await cache.getJson<number[]>(key);

    if (cached) {
      return cached;
    }

    const result = await this.genAI.models.embedContent({
      model: "gemini-embedding-001",
      contents: query,
    });

    const embeddingValues = result.embeddings?.[0]?.values;
    if (!embeddingValues) {
      throw new Error("Failed to generate embedding for query");
    }

    await cache.setJson(key, embeddingValues, 60 * 60);

    return embeddingValues;
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
