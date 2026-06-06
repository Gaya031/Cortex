import { Request, Response } from "express";
import { FileService } from "./file.service.js";

const fileService = new FileService();

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
}
