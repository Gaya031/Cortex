import { Request, Response } from "express";
import { IntelligenceService } from "./intelligence.service.js";

export class IntelligenceController {
  private readonly intelligenceService = new IntelligenceService();
  
  async getRiskAnalysis(req: Request, res: Response) {
    const rawWorkspaceId = req.params.workspaceId;
    const workspaceId = Array.isArray(rawWorkspaceId)
      ? rawWorkspaceId[0]
      : rawWorkspaceId;
    const result = await this.intelligenceService.getRiskAnalysis(workspaceId);

    return res.status(200).json({ success: true, result });
  }
}
