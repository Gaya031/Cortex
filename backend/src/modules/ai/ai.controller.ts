import { Request, Response } from "express";
import { AIService } from "./ai.service.js";

export class AIController {
  private readonly service = new AIService();

  async askRepository(req: Request, res: Response) {
    const { workspaceId, question } = req.body;

    const result = await this.service.answerRepositoryQuestion(
      workspaceId,
      question,
    );

    return res.json({
      success: true,
      result,
    });
  }
}
