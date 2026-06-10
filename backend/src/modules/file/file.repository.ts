import mongoose from "mongoose";
import { FileModel } from "./file.model.js";
import { ProjectFile } from "./file.types.js";

export class FileRepository {
  async create(file: ProjectFile) {
    return FileModel.create(file);
  }

  async createMany(files: ProjectFile[]) {
    return FileModel.insertMany(files);
  }

  async fileExists(workspaceId: string, filePath: string) {
    return FileModel.exists({
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
      path: filePath,
    });
  }

  async findByWorkspace(workspaceId: string) {
    return FileModel.find({
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
    });
  }

  async findByPath(workspaceId: string, path: string) {
    return FileModel.findOne({
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
      path,
    });
  }
  
  async deleteWorkspaceFiles(workspaceId: string) {
    return FileModel.deleteMany({
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
    });
  }
}
