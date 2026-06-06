import { FileRepository } from "../file/file.repository.js";
import { ChunkRepository } from "../chunk/chunk.repository.js";
import { GraphRepository } from "../graph/graph.repository.js";
import { ChunkService } from "../chunk/chunk.service.js";
import { GraphService } from "../graph/graph.service.js";
import { IndexWorkspaceResult } from "./indexer.types.js";
import { ResolverService } from "../resolver/resolver.service.js";
import { Chunk } from "../chunk/chunk.types.js";
import { WorkspaceRepository } from "../workspace/workspace.repository.js";
import { FilesystemService } from "../../shared/filesystem/filesystem.service.js";

export class IndexerService {
  private readonly fileRepository = new FileRepository();
  private readonly chunkRepository = new ChunkRepository();
  private readonly graphRepository = new GraphRepository();
  private readonly chunkService = new ChunkService();
  private readonly graphService = new GraphService();
  private readonly resolverService = new ResolverService();
  private readonly workspaceRepository = new WorkspaceRepository();
  private readonly fileSystemService = new FilesystemService();

  async indexWorkspace(workspaceId: string): Promise<IndexWorkspaceResult> {
    // const files = await this.fileRepository.findByWorkspace(workspaceId);
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    await this.chunkRepository.deleteWorkspaceChunks(workspaceId);
    await this.graphRepository.clearWorkspaceGraph(workspaceId);

    const files = await this.fileSystemService.getAllFiles(workspace.localPath);
    const supportedFiles = files.filter((file) =>
      [".ts", ".tsx", ".js", ".jsx"].some((ext) => file.endsWith(ext)),
    );

    //

    const result: IndexWorkspaceResult = {
      filesProcessed: 0,
      chunksCreated: 0,
      nodesCreated: 0,
      edgesCreated: 0,
    };

    const seenNodes = new Set<string>();

    for (const filePath of supportedFiles) {
      const content = await this.fileSystemService.readFile(filePath);

      const relativePath = this.fileSystemService.getRelativePath(workspace.localPath, filePath);

      const stats = await this.indexFile(
        workspaceId,
        { path: relativePath, content },
        seenNodes,
      );
      result.filesProcessed += 1;
      result.chunksCreated += stats.chunksCreated;
      result.nodesCreated += stats.nodesCreated;
      result.edgesCreated += stats.edgesCreated;
    }
    return result;
  }

  private async indexFile(
    workspaceId: string,
    file: { path: string; content: string },
    seenNodes: Set<string>,
  ) {
    const chunks = this.chunkService.generateChunks(
      workspaceId,
      file.path,
      file.content,
    );
    await this.resolveChunkDependencies(workspaceId, file.path, chunks);

    if (chunks.length > 0) {
      await this.chunkRepository.createMany(chunks);
    }
    const graph = this.graphService.buildGraph(workspaceId, file.path, chunks);

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
    for (const chunk of chunks) {
      chunk.resolvedImports = [];
      for (const importPath of chunk.imports) {
        const resolvedFile = await this.resolverService.resolveFile(
          workspaceId,
          filePath,
          importPath,
        );
        if (resolvedFile) {
          chunk.resolvedImports.push(resolvedFile);
        }
        // console.log("Resolved:", importPath, "=>", resolvedFile);
      }
    }
    return chunks;
  }
}
