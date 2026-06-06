import { Request, Response } from "express";
import { RefactorPlanService } from "./refactor-plan.service.js";

export class RefactorPlanController {
  private readonly refactorPlanService = new RefactorPlanService();

  async generatePlan(req: Request, res: Response) {
    const { workspaceId, filePath, objective } = req.body;

    const result = await this.refactorPlanService.generatePlan(
      workspaceId,
      filePath,
      objective,
    );

    return res.status(200).json({ success: true, result });
  }
}
