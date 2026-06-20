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
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    filePath: {
      type: String,
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

graphNodeSchema.index({ workspaceId: 1, nodeId: 1 }, { unique: true });
graphNodeSchema.index({ workspaceId: 1, filePath: 1 });

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
      index: true,
    },
    target: {
      type: String,
      required: true,
      index: true,
    },
    relation: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

graphEdgeSchema.index(
  { workspaceId: 1, source: 1, target: 1, relation: 1 },
  { unique: true },
);
graphEdgeSchema.index({ workspaceId: 1, relation: 1 });

export const GraphNodeModel = model("GraphNode", graphNodeSchema);
export const GraphEdgeModel = model("GraphEdge", graphEdgeSchema);
