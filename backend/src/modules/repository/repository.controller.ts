import { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { WorkspaceRepository } from "../workspace/workspace.repository.js";

const workspaceRepository = new WorkspaceRepository();

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: TreeNode[];
}

export class RepositoryController {
  async getTree(req: Request, res: Response) {
    try {
      const rawWorkspaceId = req.params.workspaceId;
      const workspaceId = Array.isArray(rawWorkspaceId)
        ? rawWorkspaceId[0]
        : rawWorkspaceId;

      if (!workspaceId) {
        return res.status(400).json({ success: false, message: "workspaceId is required" });
      }

      const workspace = await workspaceRepository.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ success: false, message: "Workspace not found" });
      }

      const localPath = workspace.localPath;
      if (!localPath) {
        return res.status(400).json({ success: false, message: "Workspace localPath not configured" });
      }

      const tree = await this.buildTree(localPath, localPath);
      return res.status(200).json({ success: true, data: tree });
    } catch (error) {
      console.error("Error building repository tree:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to load directory tree",
      });
    }
  }

  private async buildTree(dirPath: string, rootPath: string): Promise<TreeNode[]> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const children: TreeNode[] = [];

    for (const entry of entries) {
      // Exclude build, cache, and large config folders
      if (
        [
          "node_modules",
          ".git",
          "dist",
          "build",
          ".next",
          ".DS_Store",
          ".idea",
          ".vscode",
          "out",
          ".vercel",
        ].includes(entry.name)
      ) {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(rootPath, fullPath);

      if (entry.isDirectory()) {
        children.push({
          name: entry.name,
          path: relativePath,
          type: "directory",
          children: await this.buildTree(fullPath, rootPath),
        });
      } else {
        children.push({
          name: entry.name,
          path: relativePath,
          type: "file",
        });
      }
    }

    // Sort directories first, then files, alphabetically
    children.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "directory" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return children;
  }
}
