import { Schema, model } from "mongoose";
import { WorkspaceSourceType, WorkspaceStatus } from "./workspace.types.js";

const workspaceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    sourceType: {
      type: String,
      enum: Object.values(WorkspaceSourceType),
      default: WorkspaceSourceType.LOCAL,
    },
    localPath: {
      type: String,
      required: false,
    },
    githubOwner: {
      type: String,
      default: null,
    },
    githubRepo: {
      type: String,
      default: null,
    },
    githubBranch: {
      type: String,
      default: "main",
    },
    githubToken: {
      type: String,
      default: null,
      select: false,
    },
    status: {
      type: String,
      enum: Object.values(WorkspaceStatus),
      default: WorkspaceStatus.CREATED,
    },
  },
  { timestamps: true },
);

const WorkspaceModel = model("workspace", workspaceSchema);

export default WorkspaceModel;
