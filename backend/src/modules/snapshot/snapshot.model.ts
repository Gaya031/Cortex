import mongoose, {model, Model, Schema} from "mongoose"

const SnapshotSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false,
    },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "workspaces",
        required: true
    },
    files: [
        {
            filePath: String,
            content: String
        },
    ],
},{timestamps: true});

const SnapshotModel = model("snapshot", SnapshotSchema);

export default SnapshotModel;
