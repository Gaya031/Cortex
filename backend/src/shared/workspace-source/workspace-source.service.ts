import { FilesystemService } from "../filesystem/filesystem.service.js";
import { GithubService, GithubRepoRef } from "../github/github.service.js";

const SUPPORTED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

export interface WorkspaceSourceFile {
  path: string;
  content: string;
  extension: string;
  language: string;
  size: number;
}

export interface WorkspaceRecord {
  sourceType?: "local" | "github";
  localPath?: string;
  githubOwner?: string;
  githubRepo?: string;
  githubBranch?: string;
  githubToken?: string;
}

export class WorkspaceSourceService {
  private readonly filesystem = new FilesystemService();
  private readonly github = new GithubService();

  async listFiles(
    workspace: WorkspaceRecord,
    options?: { maxFiles?: number; maxFileSize?: number },
  ): Promise<WorkspaceSourceFile[]> {
    if (workspace.sourceType === "github") {
      if (!workspace.githubOwner || !workspace.githubRepo) {
        throw new Error("GitHub workspace is missing owner or repo");
      }
      const ref: GithubRepoRef = {
        owner: workspace.githubOwner,
        repo: workspace.githubRepo,
        branch: workspace.githubBranch || "main",
        token: workspace.githubToken,
      };
      return this.github.listRepositoryFiles(ref, options);
    }

    if (!workspace.localPath) {
      throw new Error("Workspace has no local path or GitHub configuration");
    }

    const absolutePaths = await this.filesystem.getAllFiles(workspace.localPath);
    const maxFiles = options?.maxFiles ?? 2000;
    const maxFileSize = options?.maxFileSize ?? 512_000;
    const files: WorkspaceSourceFile[] = [];

    for (const absolutePath of absolutePaths) {
      if (files.length >= maxFiles) break;
      if (!SUPPORTED_EXTENSIONS.some((ext) => absolutePath.endsWith(ext))) {
        continue;
      }

      const content = await this.filesystem.readFile(absolutePath);
      const size = Buffer.byteLength(content, "utf8");
      if (size > maxFileSize) continue;

      const relativePath = this.filesystem.getRelativePath(
        workspace.localPath,
        absolutePath,
      );

      files.push({
        path: relativePath.replace(/\\/g, "/"),
        content,
        extension: absolutePath.split(".").pop() ?? "",
        language:
          absolutePath.endsWith(".ts") || absolutePath.endsWith(".tsx")
            ? "typescript"
            : "javascript",
        size,
      });
    }

    return files;
  }
}
