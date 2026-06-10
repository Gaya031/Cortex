import { FileRepository } from "./file.repository.js";

export class FileService {
  constructor(private readonly fileRepository = new FileRepository()) {}

  async saveFiles(files: any[]) {
    return this.fileRepository.createMany(files);
  }

  async getWorkspaceFiles(workspaceId: string) {
    console.log("getFiles: ",await  this.fileRepository.findByWorkspace(workspaceId));
    return this.fileRepository.findByWorkspace(workspaceId);
  }
}
