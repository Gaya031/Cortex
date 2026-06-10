import { EmbeddingModel } from "./embedding.model.js";

export class EmbeddingRepository {
  async createMany(data: any[]) {
    return EmbeddingModel.insertMany(data);
  }

  async deleteWorkspaceEmbeddings(workspaceId: string) {
    return EmbeddingModel.deleteMany({ workspaceId });
  }
  async findByWorkspace(workspaceId: string) {
    return EmbeddingModel.find({ workspaceId, status: "READY" });
  }
}
