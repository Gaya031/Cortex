import WorkspaceModel from "../workspace/workspace.model.js";
import { CreateWorkspaceDto } from "./workspace.types.js";

export class WorkspaceRepository {
  async create(data: CreateWorkspaceDto) {
    return WorkspaceModel.create(data);
  }
  async findAll(userId: string) {
    return WorkspaceModel.find({ userId }).sort({ createdAt: -1 });
  }
  async findById(workspaceId: string) {
    return WorkspaceModel.findById(workspaceId);
  }

  async findByIdWithSecrets(workspaceId: string) {
    return WorkspaceModel.findById(workspaceId).select("+githubToken");
  }

  async updateStatus(workspaceId: string, status: string) {
    return WorkspaceModel.findByIdAndUpdate(workspaceId, { status }, { new: true });
  }

  async delete(workspaceId: string) {
    return WorkspaceModel.findByIdAndDelete(workspaceId);
  }
}
