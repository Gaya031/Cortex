import mongoose, { Schema, model } from "mongoose";

const decisionSchema = new Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    reasoning: {
      type: String,
      required: true,
    },
    importance: {
      type: Number,
      default: 3,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

export const DecisionModel = model("decision", decisionSchema);
