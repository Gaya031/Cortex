import SnapshotModel from "./snapshot.model.js";

export class SnapshotRepository{
    async create(data: any){
        return SnapshotModel.create(data);
    }

    async findById(id: string){
        return SnapshotModel.findById(id);
    }

    async findByWorkspace(workspaceId: string){
        return SnapshotModel.find({ workspaceId }).sort({ createdAt: -1 });
    }

    async delete(id: string){
        return SnapshotModel.findByIdAndDelete(id);
    }

    async deleteByWorkspace(workspaceId: string) {
        return SnapshotModel.deleteMany({ workspaceId });
    }
}