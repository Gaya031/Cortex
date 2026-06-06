import ChunkModel from "./chunk.model.js";
import { Chunk } from "./chunk.types.js";

export class ChunkRepository {
  async createMany(chunks: Chunk[]) {
    return ChunkModel.insertMany(chunks);
  }

  async findByWorkspace(workspaceId: string) {
    return ChunkModel.find({
      workspaceId,
    });
  }

  async findByFile(workspaceId: string, filePath: string) {
    return ChunkModel.find({
      workspaceId,
      filePath,
    });
  }

  async findByFilePath(workspaceId: string, filePath: string) {
    return ChunkModel.find({
      workspaceId,
      filePath,
    });
  }

  async deleteByFile(workspaceId: string, filePath: string) {
    return ChunkModel.deleteMany({
      workspaceId,
      filePath,
    });
  }

  async deleteWorkspaceChunks(workspaceId: string) {
    return ChunkModel.deleteMany({
      workspaceId,
    });
  }
}
