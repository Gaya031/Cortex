import path from "path";
import { FilesystemService } from "../../shared/filesystem/filesystem.service.js";
import { WorkspaceRepository } from "../workspace/workspace.repository.js";
import { SnapshotRepository } from "./snapshot.repository.js";
import { IndexerService } from "../indexer/indexer.service.js";
import { file } from "@babel/types";

export class SnapshotService {
  private readonly workspaceRepository = new WorkspaceRepository();
  private readonly fileSystemService = new FilesystemService();
  private readonly snapshotRepository = new SnapshotRepository();
  private readonly indexerService = new IndexerService();

  async createSnapshot(workspaceId: string, filePaths: string[]) {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    const files = [];

    for (const filePath of filePaths) {
      const absolutePath = path.join(workspace.localPath, filePath);
      const exists = await this.fileSystemService.exists(absolutePath);
      if (!exists) continue;

      const content = await this.fileSystemService.readFile(absolutePath);

      files.push({ filePath, content });
    }

    return this.snapshotRepository.create({ workspaceId, files });
  }

  async restoreSnapshot(snapshotId: string) {
    const snapshot = await this.snapshotRepository.findById(snapshotId);

    if (!snapshot) throw new Error("Snapshot not found");

    const workspace = await this.workspaceRepository.findById(
      snapshot.workspaceId.toString(),
    );

    if (!workspace) throw new Error("Workspace not found");

    if (!workspace.localPath) {
      throw new Error("Workspace localPath not configured");
    }

    for (const file of snapshot.files) {
      if (!file.filePath || file.content == null) {
        continue;
      }
      const absolutePath = path.join(workspace.localPath, file.filePath);
      await this.fileSystemService.writeFile(absolutePath, file.content);
    }

    const reindex = await this.indexerService.indexWorkspace(
      snapshot.workspaceId.toString(),
    );

    return {
      restored: snapshot.files.length,
      reindex,
    };
  }

  async createWorkspaceSnapshot(workspaceId: string) {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) throw new Error("workspace not found");

    const files = await this.fileSystemService.getAllFiles(workspace.localPath);
    const snapshotFiles = [];
    for (const filePath of files) {
      const content = await this.fileSystemService.readFile(filePath);
      snapshotFiles.push({
        filePath: path.relative(workspace.localPath, filePath),
        content,
      });
    }

    return this.snapshotRepository.create({
      workspaceId,
      files: snapshotFiles,
    });
  }

  async getSnapshotsByWorkspace(workspaceId: string) {
    return this.snapshotRepository.findByWorkspace(workspaceId);
  }
}
