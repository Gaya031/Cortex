import { FileRepository } from "../file/file.repository.js";
import { ChunkRepository } from "../chunk/chunk.repository.js";
import { GraphRepository } from "../graph/graph.repository.js";
import { ChunkService } from "../chunk/chunk.service.js";
import { GraphService } from "../graph/graph.service.js";
import { IndexWorkspaceResult } from "./indexer.types.js";
import { ResolverService } from "../resolver/resolver.service.js";
import { Chunk } from "../chunk/chunk.types.js";
import { WorkspaceRepository } from "../workspace/workspace.repository.js";
import { EmbeddingService } from "../embedding/embedding.service.js";
import { generateHash } from "../../shared/utils/hash.js";
import { invalidateWorkspaceCache } from "../../shared/redis/redis.js";
import { WorkspaceSourceService } from "../../shared/workspace-source/workspace-source.service.js";
import { EmbeddingRepository } from "../embedding/embedding.repository.js";
import { toFileNodeId } from "../../shared/utils/path.util.js";
import { GraphRelationType } from "../graph/graph.types.js";

const FILE_BATCH_SIZE = 200;
const INDEX_CONCURRENCY = 6;
const MAX_FILES = 2000;
const MAX_FILE_SIZE = 512_000;

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
) {
  let index = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length) {
      const current = items[index];
      index += 1;
      await worker(current);
    }
  });
  await Promise.all(runners);
}

export class IndexerService {
  private readonly fileRepository = new FileRepository();
  private readonly chunkRepository = new ChunkRepository();
  private readonly graphRepository = new GraphRepository();
  private readonly chunkService = new ChunkService();
  private readonly graphService = new GraphService();
  private readonly resolverService = new ResolverService();
  private readonly workspaceRepository = new WorkspaceRepository();
  private readonly embeddingService = new EmbeddingService();
  private readonly embeddingRepository = new EmbeddingRepository();
  private readonly workspaceSourceService = new WorkspaceSourceService();

  async indexWorkspace(workspaceId: string): Promise<IndexWorkspaceResult> {
    const workspace = await this.workspaceRepository.findByIdWithSecrets(workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    await this.chunkRepository.deleteWorkspaceChunks(workspaceId);
    await this.graphRepository.clearWorkspaceGraph(workspaceId);
    await this.fileRepository.deleteWorkspaceFiles(workspaceId);
    await invalidateWorkspaceCache(workspaceId);

    const sourceFiles = await this.workspaceSourceService.listFiles(
      {
        sourceType: workspace.sourceType as "local" | "github" | undefined,
        localPath: workspace.localPath ?? undefined,
        githubOwner: workspace.githubOwner ?? undefined,
        githubRepo: workspace.githubRepo ?? undefined,
        githubBranch: workspace.githubBranch ?? undefined,
        githubToken: workspace.githubToken ?? undefined,
      },
      {
        maxFiles: MAX_FILES,
        maxFileSize: MAX_FILE_SIZE,
      },
    );

    const fileRecords = sourceFiles.map((file) => ({
      workspaceId,
      path: file.path.replace(/\\/g, "/").replace(/^\.\//, ""),
      extension: file.extension,
      language: file.language,
      hash: generateHash(file.content),
      size: file.size,
      content: file.content,
    }));

    for (let i = 0; i < fileRecords.length; i += FILE_BATCH_SIZE) {
      await this.fileRepository.createMany(
        fileRecords.slice(i, i + FILE_BATCH_SIZE),
      );
    }

    const allPaths = fileRecords.map((file) => file.path);
    this.resolverService.setWorkspaceFiles(workspaceId, allPaths);
    await this.resolverService.loadPathAliasesFromWorkspace(workspaceId);

    const result: IndexWorkspaceResult = {
      filesProcessed: 0,
      chunksCreated: 0,
      nodesCreated: 0,
      edgesCreated: 0,
      skippedFiles: sourceFiles.length === MAX_FILES ? 1 : 0,
    };

    const seenNodes = new Set<string>();

    await runWithConcurrency(sourceFiles, INDEX_CONCURRENCY, async (file) => {
      try {
        const stats = await this.indexFile(
          workspaceId,
          { path: file.path, content: file.content },
          seenNodes,
        );
        result.filesProcessed += 1;
        result.chunksCreated += stats.chunksCreated;
        result.nodesCreated += stats.nodesCreated;
        result.edgesCreated += stats.edgesCreated;
      } catch (error) {
        console.warn(`Failed to index ${file.path}:`, error);
      }
    });

    await this.graphService.buildCallEdges(workspaceId);
    await this.rebuildFileImportEdges(workspaceId);
    await this.embeddingService.generateWorkspaceEmbeddings(workspaceId);
    await invalidateWorkspaceCache(workspaceId);

    this.resolverService.clearWorkspace(workspaceId);

    return result;
  }

  private async rebuildFileImportEdges(workspaceId: string) {
    const chunks = await this.chunkRepository.findByWorkspace(workspaceId);
    const importsByFile = new Map<string, Set<string>>();

    for (const chunk of chunks) {
      const filePath = chunk.filePath.replace(/\\/g, "/").replace(/^\.\//, "");
      if (!importsByFile.has(filePath)) {
        importsByFile.set(filePath, new Set());
      }
      const bucket = importsByFile.get(filePath)!;

      for (const importPath of chunk.imports ?? []) {
        const resolved = await this.resolverService.resolveFile(
          workspaceId,
          filePath,
          importPath,
        );
        if (resolved) {
          bucket.add(resolved);
        }
      }
    }

    const edges: Array<{
      workspaceId: string;
      source: string;
      target: string;
      relation: GraphRelationType;
    }> = [];

    for (const [sourceFile, targets] of importsByFile) {
      const sourceId = toFileNodeId(sourceFile);
      for (const targetFile of targets) {
        edges.push({
          workspaceId,
          source: sourceId,
          target: toFileNodeId(targetFile),
          relation: GraphRelationType.FILE_IMPORTS_FILE,
        });
      }
    }

    if (edges.length > 0) {
      await this.graphRepository.createEdges(edges);
    }
  }

  private async indexFile(
    workspaceId: string,
    file: { path: string; content: string },
    seenNodes: Set<string>,
  ) {
    const normalizedPath = file.path.replace(/\\/g, "/").replace(/^\.\//, "");
    const chunks = this.chunkService.generateChunks(
      workspaceId,
      normalizedPath,
      file.content,
    );
    await this.resolveChunkDependencies(workspaceId, normalizedPath, chunks);

    if (chunks.length > 0) {
      await this.chunkRepository.createMany(chunks);
    }

    const graph = this.graphService.buildGraph(workspaceId, normalizedPath, chunks);

    graph.nodes = graph.nodes.filter((node) => {
      const key = `${workspaceId}:${node.nodeId}`;
      if (seenNodes.has(key)) return false;
      seenNodes.add(key);
      return true;
    });

    if (graph.nodes.length > 0) {
      await this.graphRepository.createNodes(graph.nodes);
    }
    if (graph.edges.length > 0) {
      await this.graphRepository.createEdges(graph.edges);
    }

    return {
      chunksCreated: chunks.length,
      nodesCreated: graph.nodes.length,
      edgesCreated: graph.edges.length,
    };
  }

  private async resolveChunkDependencies(
    workspaceId: string,
    filePath: string,
    chunks: Chunk[],
  ) {
    const resolvedImportSet = new Set<string>();

    for (const chunk of chunks) {
      chunk.resolvedImports = [];
      chunk.dependencies = [];

      for (const importPath of chunk.imports) {
        const resolvedFile = await this.resolverService.resolveFile(
          workspaceId,
          filePath,
          importPath,
        );
        if (resolvedFile) {
          const normalized = resolvedFile.replace(/\\/g, "/").replace(/^\.\//, "");
          chunk.resolvedImports.push(normalized);
          resolvedImportSet.add(normalized);
        }
      }

      chunk.resolvedImports = [...new Set(chunk.resolvedImports)];
      chunk.dependencies = [...resolvedImportSet];

      for (const binding of chunk.importBindings ?? []) {
        const resolvedFile = await this.resolverService.resolveFile(
          workspaceId,
          filePath,
          binding.modulePath,
        );
        if (resolvedFile) {
          binding.resolvedFilePath = resolvedFile
            .replace(/\\/g, "/")
            .replace(/^\.\//, "");
        }
      }
    }

    return chunks;
  }

  async getWorkspaceStats(workspaceId: string) {
    const [files, chunks, embeddings, workspace] = await Promise.all([
      this.fileRepository.findByWorkspace(workspaceId),
      this.chunkRepository.findByWorkspace(workspaceId),
      this.embeddingRepository.findByWorkspace(workspaceId),
      this.workspaceRepository.findById(workspaceId),
    ]);

    const embeddableTypes = new Set(["FUNCTION", "METHOD", "COMPONENT"]);
    const embeddableChunks = chunks.filter((c) =>
      embeddableTypes.has(String(c.type)),
    );

    return {
      status: workspace?.status ?? "UNKNOWN",
      sourceType: workspace?.sourceType ?? "LOCAL",
      filesIndexed: files.length,
      chunksTotal: chunks.length,
      embeddableChunks: embeddableChunks.length,
      embeddingsReady: embeddings.length,
      embeddingCoverage: embeddableChunks.length
        ? Math.round((embeddings.length / embeddableChunks.length) * 100)
        : 0,
    };
  }
}
