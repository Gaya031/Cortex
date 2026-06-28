import {Schema, model} from "mongoose";

const embeddingSchema = new Schema ({
    workspaceId: {
        type: String,
        required: true
    },
    chunkId: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    content: {
        type: String, 
        required: true,
    },
    contentHash: {
        type: String,
        required: true
    },
    embedding: {
        type: [Number],
        required: true,
    },
    status: {
        type: String,
        default: "READY",
    },
}, {timestamps: true});

embeddingSchema.index({ workspaceId: 1, chunkId: 1 }, { unique: true });
embeddingSchema.index({ contentHash: 1 });

export const EmbeddingModel = model("embedding", embeddingSchema);
