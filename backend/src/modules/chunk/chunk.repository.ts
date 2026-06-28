import ChunkModel from "./chunk.model.js";
import { Chunk, ChunkType } from "./chunk.types.js";

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

  async bulkUpdateRelationships(
    workspaceId: string,
    updates: Array<{
      filePath: string;
      name: string;
      type: string;
      parentChunk?: string;
      dependencies: string[];
      calledBy: string[];
    }>,
  ) {
    if (!updates.length) return;

    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: {
          workspaceId,
          filePath: update.filePath,
          name: update.name,
          type: update.type as ChunkType,
          ...(update.parentChunk ? { parentChunk: update.parentChunk } : {}),
        },
        update: {
          $set: {
            dependencies: update.dependencies,
            calledBy: update.calledBy,
          },
        },
      },
    }));

    return ChunkModel.bulkWrite(bulkOps, { ordered: false });
  }
}
