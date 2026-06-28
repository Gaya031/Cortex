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
    return FileModel.find(
      {
        workspaceId: new mongoose.Types.ObjectId(workspaceId),
      },
      {
        path: 1,
        extension: 1,
        language: 1,
        hash: 1,
        size: 1,
        workspaceId: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    );
  }

  async updateContent(workspaceId: string, filePath: string, content: string) {
    return FileModel.findOneAndUpdate(
      {
        workspaceId: new mongoose.Types.ObjectId(workspaceId),
        path: filePath,
      },
      {
        $set: {
          content,
          size: Buffer.byteLength(content, "utf8"),
        },
      },
      { new: true, upsert: true },
    );
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
