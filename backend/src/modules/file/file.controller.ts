import { Request, Response } from "express";
import { FileService } from "./file.service.js";
import { IndexerService } from "../indexer/indexer.service.js";
import { invalidateWorkspaceCache } from "../../shared/redis/redis.js";
import { WorkspaceContentService } from "../../shared/workspace-content/workspace-content.service.js";

const fileService = new FileService();
const indexerService = new IndexerService();
const contentService = new WorkspaceContentService();

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

      const content = await contentService.readFile(
        workspaceId as string,
        filePath as string,
      );

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

      await contentService.writeFile(
        workspaceId,
        filePath,
        content,
        `Update ${filePath} via Cortex`,
      );
      await invalidateWorkspaceCache(workspaceId);

      indexerService.indexWorkspace(workspaceId).catch((idxError) => {
        console.error("Error re-indexing after save:", idxError);
      });

      return res.status(200).json({
        success: true,
        message: "File saved successfully. Re-indexing started in background.",
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
