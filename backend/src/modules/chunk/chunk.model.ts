import { Schema, model } from "mongoose";
import { Chunk } from "./chunk.types.js";

const chunkSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    filePath: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    startLine: {
      type: Number,
      required: true,
    },
    endLine: {
      type: Number,
      required: true,
    },
    imports: {
      type: [String],
      default: [],
    },
    exports: {
      type: [String],
      default: [],
    },
    resolvedImports: {
      type: [String],
      default: [],
    },
    importBindings: [
      {
        localName: { type: String, required: true },
        importedName: { type: String, required: true },
        modulePath: { type: String, required: true },
        resolvedFilePath: { type: String, default: null },
      },
    ],
    dependencies: {
      type: [String],
      default: [],
    },
    calls: {
      type: [String],
      default: [],
    },
    calledBy: { type: [String], default: [] },
    parameters: [
      {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          default: "unknown",
        },
      },
    ],
    returnType: {
      type: String,
      default: null,
    },
    parentChunk: {
      type: String,
      default: null,
    },
    embeddingStatus: {
      type: String,
      enum: ["PENDING", "PROCESSING", "READY", "FAILED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

chunkSchema.index({
  workspaceId: 1,
  filePath: 1,
});

const ChunkModel = model<Chunk>("Chunk", chunkSchema);

export default ChunkModel;
