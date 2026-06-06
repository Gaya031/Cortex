import { model, Schema } from "mongoose";

const graphNodeSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    nodeId: {
      type: String,
      required: true,
      // unique: true,
    },
    type: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      // required: true
    }
  },
  { timestamps: true },
);

const graphEdgeSchema = new Schema(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    source: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      required: true,
    },
    relation: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const GraphNodeModel = model(
  "GraphNode",
  graphNodeSchema.index({ workspaceId: 1, nodeId: 1 }, { unique: true }),
);
export const GraphEdgeModel = model("GraphEdge", graphEdgeSchema);
