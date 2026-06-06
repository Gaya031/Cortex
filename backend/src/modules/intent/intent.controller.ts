import { Request, Response } from "express";
import { IntentService } from "./intent.service.js";

export class IntentController {
  private readonly intentService = new IntentService();

  async analyzeIntent(req: Request, res: Response) {
    const { workspaceId, goal } = req.body;
    const result = await this.intentService.analyzeIntent(workspaceId, goal);
    return res.status(200).json({
      success: true,
      result,
    });
  }
}
