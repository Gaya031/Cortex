import { Request, Response } from "express";
import { ChangeSetExecutorService } from "./changeset-executor.service.js";

export class ChangeSetExectorController {
  private readonly changeSetExecutorService = new ChangeSetExecutorService();

  async execute(req: Request, res: Response) {
    const { workspaceId, changeSet } = req.body;
    const result = await this.changeSetExecutorService.execute(
      workspaceId,
      changeSet,
    );
    res.status(200).json({ success: true, result });
  }
}
