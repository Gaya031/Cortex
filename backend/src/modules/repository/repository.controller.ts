import { Request, Response } from "express";
import { FileRepository } from "../file/file.repository.js";

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: TreeNode[];
}

export class RepositoryController {
  private readonly fileRepository = new FileRepository();

  async getTree(req: Request, res: Response) {
    try {
      const rawWorkspaceId = req.params.workspaceId;
      const workspaceId = Array.isArray(rawWorkspaceId)
        ? rawWorkspaceId[0]
        : rawWorkspaceId;

      if (!workspaceId) {
        return res.status(400).json({ success: false, message: "workspaceId is required" });
      }

      const files = await this.fileRepository.findByWorkspace(workspaceId);
      const tree = this.buildTreeFromPaths(files.map((file) => file.path));

      return res.status(200).json({ success: true, data: tree });
    } catch (error) {
      console.error("Error building repository tree:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to load directory tree",
      });
    }
  }

  private buildTreeFromPaths(paths: string[]): TreeNode[] {
    const root: TreeNode[] = [];

    for (const filePath of paths.sort()) {
      const parts = filePath.split("/");
      let currentLevel = root;

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        const currentPath = parts.slice(0, index + 1).join("/");
        let existing = currentLevel.find((node) => node.name === part);

        if (!existing) {
          existing = {
            name: part,
            path: currentPath,
            type: isFile ? "file" : "directory",
            children: isFile ? undefined : [],
          };
          currentLevel.push(existing);
        }

        if (!isFile && existing.children) {
          currentLevel = existing.children;
        }
      });
    }

    const sortNodes = (nodes: TreeNode[]): TreeNode[] =>
      nodes
        .map((node) => ({
          ...node,
          children: node.children ? sortNodes(node.children) : undefined,
        }))
        .sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === "directory" ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });

    return sortNodes(root);
  }
}
