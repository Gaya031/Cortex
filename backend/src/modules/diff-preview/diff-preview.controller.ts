import { Request, Response } from "express";
import { DiffPreviewService } from "./diff-preview.service.js";

export class DiffPreviewController {
  private readonly diffPreviewService = new DiffPreviewService();

  async previewMoveFunction(req: Request, res: Response) {
    const { workspaceId, functionName, sourceFile, targetFile } = req.body;

    const result = await this.diffPreviewService.previewMoveFunction(
      workspaceId,
      functionName,
      sourceFile,
      targetFile,
    );

    return res.status(200).json({ success: true, result });
  }
}
