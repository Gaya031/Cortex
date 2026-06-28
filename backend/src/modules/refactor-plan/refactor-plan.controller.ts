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

  async generate(req: Request, res: Response) {
    const { workspaceId, goal } = req.body;
    const result = await this.refactorPlanService.generate(workspaceId, goal);
        
    return res.json({
      success: true,
      result,
    });
  }
}
