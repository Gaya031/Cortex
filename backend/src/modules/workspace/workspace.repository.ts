import WorkspaceModel from "../workspace/workspace.model.js";

export class WorkspaceRepository {
  async create(data: { userId: string; name: string; description?: string }) {
    return WorkspaceModel.create(data);
  }
  async findAll(userId: string) {
    return WorkspaceModel.find({ userId }).sort({ createdAt: -1 });
  }
  async findById(workspaceId: string) {
    return WorkspaceModel.findById(workspaceId);
  }

  async updateStatus(workspaceId: string, status: string) {
    return WorkspaceModel.findByIdAndUpdate(workspaceId, { status }, { new: true });
  }

  async delete(workspaceId: string) {
    return WorkspaceModel.findByIdAndDelete(workspaceId);
  }
}
