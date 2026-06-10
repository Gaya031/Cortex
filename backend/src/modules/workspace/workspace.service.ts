import { IndexerService } from "../indexer/indexer.service.js";
import { WorkspaceRepository } from "./workspace.repository.js";
import { CreateWorkspaceDto } from "./workspace.types.js";

export class WorkspaceService {
 
  constructor(
    private readonly workspaceRepository = new WorkspaceRepository(),
     private readonly indexerService = new IndexerService()
  ) {}
  async createWorkspace(payload: CreateWorkspaceDto) {
    const workspace = await this.workspaceRepository.create(payload);
    await this.indexerService.indexWorkspace(workspace._id.toString());
    return workspace;
  }
  async getAllWorkspace() {
    return this.workspaceRepository.findAll();
  }
  async getWorkspaceById(id: string) {
    return this.workspaceRepository.findById(id);
  }
}
