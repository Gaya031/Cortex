import { Schema, model } from "mongoose";
import { WorkspaceStatus } from "./workspace.types.js";

const workspaceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: false, // Make it optional temporarily for backward compatibility
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
    localPath: {
      type: String,
      required: true,
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
