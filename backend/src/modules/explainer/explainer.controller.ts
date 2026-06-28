import { Request, Response } from "express";

import { ExplainerService } from "./explainer.service.js";

export class ExplainerController {
  private readonly ExplainerService = new ExplainerService();

  async explainFile(req: Request, res: Response) {
    const { workspaceId, filePath } = req.body;
    const result = await this.ExplainerService.explainFile(
      workspaceId,
      filePath,
    );
    return res.json({ result });
  }

  async explainProject(req: Request, res: Response) {
    const workspaceId = Array.isArray(req.params.workspaceId)
      ? req.params.workspaceId[0]
      : req.params.workspaceId;
    const result = await this.ExplainerService.explainProject(workspaceId);
    return res.json({ result });
  }

  async explainFileWithAI(req: Request, res: Response) {
    const { workspaceId, filePath } = req.body;

    const result = await this.ExplainerService.explainFileWithAI(
      workspaceId,
      filePath,
    );

    return res.status(200).json({ success: true, result });
  }

  async explainProjectWithAI(req: Request, res: Response) {
    const { workspaceId } = req.body;
    const result = await this.ExplainerService.explainProjectWithAI(workspaceId);
    return res.status(200).json({ success: true, result });
  }
}
