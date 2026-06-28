import { Schema, model } from "mongoose";

const embeddingCacheSchema = new Schema(
  {
    contentHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    model: {
      type: String,
      default: "gemini-embedding-001",
    },
  },
  { timestamps: true },
);

export const EmbeddingCacheModel = model("embedding_cache", embeddingCacheSchema);
