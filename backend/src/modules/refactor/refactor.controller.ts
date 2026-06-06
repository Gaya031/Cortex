import { Request, Response } from "express";
import { RefactorService } from "./refactor.service.js";

export class RefactorController {
  private readonly refactorService = new RefactorService();

  async recommend(req: Request, res: Response) {
    const { workspaceId, filePath } = req.body;

    const result = await this.refactorService.recommendRefactor(
      workspaceId,
      filePath,
    );

    res.status(200).json({ success: true, result });
  }
}
