import { Request, Response } from "express";
import { DiffPreviewService } from "./diff-preview.service.js";
import { AstRefactorService } from "../ast-refactor/ast-refactor.service.js";

export class DiffPreviewController {
  private readonly diffPreviewService = new DiffPreviewService();
  private readonly astRefactorService = new AstRefactorService();
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

  async previewRenameFunction(req: Request, res: Response){
    const {workspaceId, oldName, newName} = req.body;
    const result = await this.astRefactorService.previewRenameFunction(workspaceId, oldName, newName);
    return res.status(200).json({success: true, result});
    
  }
}
