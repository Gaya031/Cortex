import { FileRepository } from "./file.repository.js";

export class FileService {
  constructor(private readonly fileRepository = new FileRepository()) {}

  async saveFiles(files: any[]) {
    return this.fileRepository.createMany(files);
  }

  async getWorkspaceFiles(workspaceId: string) {
    return this.fileRepository.findByWorkspace(workspaceId);
  }
}
