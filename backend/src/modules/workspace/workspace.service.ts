import { IndexerService } from "../indexer/indexer.service.js";
import { WorkspaceRepository } from "./workspace.repository.js";
import { CreateWorkspaceDto } from "./workspace.types.js";
import { ChunkRepository } from "../chunk/chunk.repository.js";
import { GraphRepository } from "../graph/graph.repository.js";
import { FileRepository } from "../file/file.repository.js";
import { EmbeddingRepository } from "../embedding/embedding.repository.js";
import { DecisionRepository } from "../decision/decision.repository.js";
import { SnapshotRepository } from "../snapshot/snapshot.repository.js";

export class WorkspaceService {
 
  constructor(
    private readonly workspaceRepository = new WorkspaceRepository(),
     private readonly indexerService = new IndexerService(),
     private readonly chunkRepository = new ChunkRepository(),
     private readonly graphRepository = new GraphRepository(),
     private readonly fileRepository = new FileRepository(),
     private readonly embeddingRepository = new EmbeddingRepository(),
     private readonly decisionRepository = new DecisionRepository(),
     private readonly snapshotRepository = new SnapshotRepository()
  ) {}
  async createWorkspace(payload: CreateWorkspaceDto) {
    const workspace = await this.workspaceRepository.create({ ...payload, status: 'PROCESSING' });
    
    // Background indexing to prevent blocking
    this.indexerService.indexWorkspace(workspace._id.toString())
      .then(async () => {
        await this.workspaceRepository.updateStatus(workspace._id.toString(), 'READY');
      })
      .catch(async (err) => {
        console.error("Indexing failed:", err);
        await this.workspaceRepository.updateStatus(workspace._id.toString(), 'FAILED');
      });

    return workspace;
  }
  async getAllWorkspace(userId: string) {
    return this.workspaceRepository.findAll(userId);
  }
  async getWorkspaceById(id: string) {
    return this.workspaceRepository.findById(id);
  }

  async deleteWorkspace(id: string, userId: string) {
    const workspace = await this.workspaceRepository.findById(id);
    if (!workspace) {
      throw new Error("Workspace not found");
    }
    if (workspace.userId?.toString() !== userId) {
      throw new Error("Unauthorized to delete this workspace");
    }

    // Cascade delete associated data
    await Promise.all([
      this.chunkRepository.deleteWorkspaceChunks(id),
      this.graphRepository.clearWorkspaceGraph(id),
      this.fileRepository.deleteWorkspaceFiles(id),
      this.embeddingRepository.deleteWorkspaceEmbeddings(id),
      this.decisionRepository.deleteByWorkspace(id),
      this.snapshotRepository.deleteByWorkspace(id),
    ]);

    // Finally, delete the workspace itself
    await this.workspaceRepository.delete(id);
    return true;
  }
}
