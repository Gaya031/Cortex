import SnapshotModel from "./snapshot.model.js";

export class SnapshotRepository{
    async create(data: any){
        return SnapshotModel.create(data);
    }

    async findById(id: string){
        return SnapshotModel.findById(id);
    }

    async delete(id: string){
        return SnapshotModel.findByIdAndDelete(id);
    }
}