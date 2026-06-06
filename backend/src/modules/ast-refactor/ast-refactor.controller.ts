import { Request, Response } from "express";
import { AstRefactorService } from "./ast-refactor.service.js";
import { IndexerService } from "../indexer/indexer.service.js";

export class AstRefactorController {
  private readonly astrefactorService = new AstRefactorService();
  private readonly indexerService = new IndexerService();

  async moveFunction(req: Request, res: Response) {
    const { workspaceId, functionName, sourceFile, targetFile } = req.body;

    const result = await this.astrefactorService.moveFunction(
      workspaceId,
      functionName,
      sourceFile,
      targetFile,
    );

    const indexingResult =
      await this.indexerService.indexWorkspace(workspaceId);

    res
      .status(200)
      .json({ success: true, refactor: result, reindex: indexingResult });
  }
}
