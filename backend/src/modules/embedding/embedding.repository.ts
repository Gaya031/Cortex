import { EmbeddingModel } from "./embedding.model.js";

export class EmbeddingRepository {
  async createMany(data: any[]) {
    return EmbeddingModel.insertMany(data, { ordered: false });
  }

  async deleteWorkspaceEmbeddings(workspaceId: string) {
    return EmbeddingModel.deleteMany({ workspaceId });
  }

  async deleteOrphanedEmbeddings(workspaceId: string, activeChunkIds: string[]) {
    return EmbeddingModel.deleteMany({
      workspaceId,
      chunkId: { $nin: activeChunkIds },
    });
  }

  async findByWorkspace(workspaceId: string) {
    return EmbeddingModel.find({ workspaceId, status: "READY" });
  }

  async findByChunkIds(workspaceId: string, chunkIds: string[]) {
    if (!chunkIds.length) return [];
    return EmbeddingModel.find({
      workspaceId,
      chunkId: { $in: chunkIds },
    });
  }

  async upsertMany(
    entries: Array<{
      workspaceId: string;
      chunkId: string;
      filePath: string;
      content: string;
      contentHash: string;
      embedding: number[];
      status: string;
    }>,
  ) {
    if (!entries.length) return;

    const ops = entries.map((entry) => ({
      updateOne: {
        filter: {
          workspaceId: entry.workspaceId,
          chunkId: entry.chunkId,
        },
        update: { $set: entry },
        upsert: true,
      },
    }));

    return EmbeddingModel.bulkWrite(ops, { ordered: false });
  }
}
