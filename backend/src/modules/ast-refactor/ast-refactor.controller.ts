import { Request, Response } from "express";
import { AstRefactorService } from "./ast-refactor.service.js";
import { IndexerService } from "../indexer/indexer.service.js";
import { invalidateWorkspaceCache } from "../../shared/redis/redis.js";

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
    await invalidateWorkspaceCache(workspaceId);

    const indexingResult =
      await this.indexerService.indexWorkspace(workspaceId);

    res
      .status(200)
      .json({ success: true, refactor: result, reindex: indexingResult });
  }

  async renameFunction(req: Request, res: Response) {
    const { workspaceId, oldName, newName } = req.body;

    const result = await this.astrefactorService.renameFunction(
      workspaceId,
      oldName,
      newName,
    );
    await invalidateWorkspaceCache(workspaceId);
    const indexingResult =
      await this.indexerService.indexWorkspace(workspaceId);

    return res
      .status(200)
      .json({ success: true, result, reindex: indexingResult });
  }
}
