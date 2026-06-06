import WorkspaceModel from "../workspace/workspace.model.js";

export class WorkspaceRepository {
  async create(data: { name: string; description?: string }) {
    return WorkspaceModel.create(data);
  }
  async findAll() {
    return WorkspaceModel.find().sort({ createdAt: -1 });
  }
  async findById(workspaceId: string) {
    return WorkspaceModel.findById(workspaceId);
  }


}
