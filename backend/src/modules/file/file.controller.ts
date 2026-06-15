import { Request, Response } from "express";
import { FileService } from "./file.service.js";
import { WorkspaceRepository } from "../workspace/workspace.repository.js";
import { FilesystemService } from "../../shared/filesystem/filesystem.service.js";
import { IndexerService } from "../indexer/indexer.service.js";
import path from "path";

const fileService = new FileService();
const workspaceRepository = new WorkspaceRepository();
const filesystemService = new FilesystemService();
const indexerService = new IndexerService();

export class FileController {
  async create(req: Request, res: Response) {
    const file = await fileService.saveFiles([req.body]);

    return res.status(201).json({
      success: true,
      data: file,
    });
  }

  async getWorkspaceFiles(req: Request, res: Response) {
    const workspaceId = Array.isArray(req.params.workspaceId)
      ? req.params.workspaceId[0]
      : req.params.workspaceId;

    const files = await fileService.getWorkspaceFiles(workspaceId);
    return res.status(200).json({
      success: true,
      data: files,
    });
  }

  async getFileContent(req: Request, res: Response) {
    try {
      const { workspaceId, filePath } = req.query;
      if (!workspaceId || !filePath) {
        return res.status(400).json({
          success: false,
          message: "workspaceId and filePath are required",
        });
      }

      const workspace = await workspaceRepository.findById(workspaceId as string);
      if (!workspace) {
        return res.status(404).json({ success: false, message: "Workspace not found" });
      }

      const absolutePath = path.join(workspace.localPath, filePath as string);
      const exists = await filesystemService.exists(absolutePath);
      if (!exists) {
        return res.status(404).json({ success: false, message: "File not found on disk" });
      }

      const content = await filesystemService.readFile(absolutePath);
      return res.status(200).json({
        success: true,
        data: { content, filePath },
      });
    } catch (error) {
      console.error("Error reading file content:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to read file content",
      });
    }
  }

  async saveFileContent(req: Request, res: Response) {
    try {
      const { workspaceId, filePath, content } = req.body;
      if (!workspaceId || !filePath || content === undefined) {
        return res.status(400).json({
          success: false,
          message: "workspaceId, filePath, and content are required",
        });
      }

      const workspace = await workspaceRepository.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ success: false, message: "Workspace not found" });
      }

      const absolutePath = path.join(workspace.localPath, filePath);
      await filesystemService.writeFile(absolutePath, content);

      // Trigger re-indexing of workspace
      let indexResult = null;
      try {
        indexResult = await indexerService.indexWorkspace(workspaceId);
      } catch (idxError) {
        console.error("Error re-indexing after save:", idxError);
      }

      return res.status(200).json({
        success: true,
        message: "File saved successfully",
        data: indexResult,
      });
    } catch (error) {
      console.error("Error saving file:", error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to save file content",
      });
    }
  }
}

