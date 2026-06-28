import { FilesystemService } from "../../shared/filesystem/filesystem.service.js";
import { WorkspaceContentService } from "../../shared/workspace-content/workspace-content.service.js";
import { WorkspaceRepository } from "../workspace/workspace.repository.js";
import { IndexerService } from "../indexer/indexer.service.js";
import { SnapshotRepository } from "./snapshot.repository.js";
import { invalidateWorkspaceCache } from "../../shared/redis/redis.js";

export class SnapshotService {
  private readonly workspaceRepository = new WorkspaceRepository();
  private readonly fileSystemService = new FilesystemService();
  private readonly contentService = new WorkspaceContentService();
  private readonly snapshotRepository = new SnapshotRepository();
  private readonly indexerService = new IndexerService();

  async createSnapshot(workspaceId: string, filePaths: string[]) {
    const files = [];

    for (const filePath of filePaths) {
      try {
        const content = await this.contentService.readFile(
          workspaceId,
          filePath,
        );
        files.push({ filePath, content });
      } catch {
        continue;
      }
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

    for (const file of snapshot.files) {
      if (!file.filePath || file.content == null) {
        continue;
      }
      await this.contentService.writeFile(
        snapshot.workspaceId.toString(),
        file.filePath,
        file.content,
      );
    }

    const reindex = await this.indexerService.indexWorkspace(
      snapshot.workspaceId.toString(),
    );
    await invalidateWorkspaceCache(snapshot.workspaceId.toString());

    return {
      restored: snapshot.files.length,
      reindex,
    };
  }

  async createWorkspaceSnapshot(workspaceId: string) {
    const paths = await this.contentService.listSourceFilePaths(workspaceId);
    const snapshotFiles = [];

    for (const filePath of paths) {
      try {
        const content = await this.contentService.readFile(
          workspaceId,
          filePath,
        );
        snapshotFiles.push({ filePath, content });
      } catch {
        continue;
      }
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
