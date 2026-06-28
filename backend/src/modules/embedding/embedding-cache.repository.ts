import { EmbeddingCacheModel } from "./embedding-cache.model.js";

export class EmbeddingCacheRepository {
  async findByHash(contentHash: string) {
    return EmbeddingCacheModel.findOne({ contentHash }).lean();
  }

  async findByHashes(contentHashes: string[]) {
    if (!contentHashes.length) return [];
    return EmbeddingCacheModel.find({
      contentHash: { $in: contentHashes },
    }).lean();
  }

  async upsert(contentHash: string, embedding: number[], model = "gemini-embedding-001") {
    return EmbeddingCacheModel.findOneAndUpdate(
      { contentHash },
      { contentHash, embedding, model },
      { upsert: true, new: true },
    );
  }
}
