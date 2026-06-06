import { Request, Response } from "express";

import { DecisionService } from "./decision.service.js";

export class DecisionController {
  private readonly service = new DecisionService();

  async createDecision(req: Request, res: Response) {
    const result = await this.service.createDecision(req.body);
    return res.json({ success: true, result });
  }

  async getDecision(req: Request, res: Response) {
    const workspaceId = Array.isArray(req.params.workspaceId)
      ? req.params.workspaceId[0]
      : req.params.workspaceId;
    const result = await this.service.getWorkspaceDecisions(workspaceId);
    res.json({success: true, result});
  }
}
