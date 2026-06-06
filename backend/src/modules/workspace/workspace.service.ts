import { WorkspaceRepository } from "./workspace.repository.js";
import { CreateWorkspaceDto } from "./workspace.types.js";

export class WorkspaceService {
  constructor(
    private readonly workspaceRepository = new WorkspaceRepository(),
  ) {}
  async createWorkspace(payload: CreateWorkspaceDto) {
    return this.workspaceRepository.create(payload);
  }
  async getAllWorkspace() {
    return this.workspaceRepository.findAll();
  }
  async getWorkspaceById(id: string) {
    return this.workspaceRepository.findById(id);
  }
}
