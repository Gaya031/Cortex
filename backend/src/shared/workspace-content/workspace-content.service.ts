import path from "path";
import { FileRepository } from "../../modules/file/file.repository.js";
import { WorkspaceRepository } from "../../modules/workspace/workspace.repository.js";
import { WorkspaceSourceType } from "../../modules/workspace/workspace.types.js";
import { FilesystemService } from "../filesystem/filesystem.service.js";
import { GithubService, GithubRepoRef } from "../github/github.service.js";

export class WorkspaceContentService {
  private readonly fileRepository = new FileRepository();
  private readonly workspaceRepository = new WorkspaceRepository();
  private readonly filesystem = new FilesystemService();
  private readonly github = new GithubService();

  private async getWorkspace(workspaceId: string) {
    const workspace = await this.workspaceRepository.findByIdWithSecrets(
      workspaceId,
    );
    if (!workspace) throw new Error("Workspace not found");
    return workspace;
  }

  private githubRef(workspace: Awaited<ReturnType<typeof this.getWorkspace>>): GithubRepoRef {
    return {
      owner: workspace.githubOwner!,
      repo: workspace.githubRepo!,
      branch: workspace.githubBranch || "main",
      token: workspace.githubToken ?? undefined,
    };
  }

  async readFile(workspaceId: string, filePath: string): Promise<string> {
    const workspace = await this.getWorkspace(workspaceId);
    const normalized = filePath.replace(/\\/g, "/").replace(/^\.\//, "");

    const stored = await this.fileRepository.findByPath(workspaceId, normalized);
    if (stored?.content) return stored.content;

    if (workspace.sourceType === WorkspaceSourceType.GITHUB) {
      const entry = await this.github.fetchFileContent(
        this.githubRef(workspace),
        normalized,
      );
      return entry.content;
    }

    if (!workspace.localPath) {
      throw new Error("Workspace has no readable source configured");
    }

    return this.filesystem.readFile(
      path.join(workspace.localPath, normalized),
    );
  }

  async writeFile(
    workspaceId: string,
    filePath: string,
    content: string,
    commitMessage?: string,
  ) {
    const workspace = await this.getWorkspace(workspaceId);
    const normalized = filePath.replace(/\\/g, "/").replace(/^\.\//, "");

    await this.fileRepository.updateContent(workspaceId, normalized, content);

    if (workspace.sourceType === WorkspaceSourceType.GITHUB) {
      await this.github.updateFileContent(
        this.githubRef(workspace),
        normalized,
        content,
        commitMessage ?? `Update ${normalized} via Cortex Code`,
      );
      return;
    }

    if (!workspace.localPath) {
      throw new Error("Workspace has no writable source configured");
    }

    await this.filesystem.writeFile(
      path.join(workspace.localPath, normalized),
      content,
    );
  }

  async listSourceFilePaths(workspaceId: string): Promise<string[]> {
    const workspace = await this.getWorkspace(workspaceId);
    const files = await this.fileRepository.findByWorkspace(workspaceId);
    if (files.length > 0) {
      return files.map((f) => f.path);
    }

    if (workspace.sourceType === WorkspaceSourceType.GITHUB) {
      const entries = await this.github.listRepositoryFiles(this.githubRef(workspace));
      return entries.map((e) => e.path);
    }

    if (!workspace.localPath) return [];

    const absolute = await this.filesystem.getAllFiles(workspace.localPath);
    return absolute
      .filter((f) => /\.(ts|tsx|js|jsx)$/.test(f))
      .map((f) => this.filesystem.getRelativePath(workspace.localPath!, f));
  }
}
