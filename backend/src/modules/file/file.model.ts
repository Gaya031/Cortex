import { Schema, model } from "mongoose";

const fileSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    path: {
      type: String,
      required: true,
      index: true,
    },
    extension: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      index: true,
    },
    hash: {
      type: String,
      required: true,
      index: true,
    },
    size: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

fileSchema.index({ workspaceId: 1, path: 1 });

export const FileModel = model("file", fileSchema);