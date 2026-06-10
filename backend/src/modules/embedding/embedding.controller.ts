import { Request, Response } from "express";
import { EmbeddingService } from "./embedding.service.js";

export class EmbeddingController {
  private readonly service = new EmbeddingService();
  async generate(req: Request, res: Response) {
    const workspaceId = Array.isArray(req.params.workspaceId)
      ? req.params.workspaceId[0]
      : req.params.workspaceId;
    const result = await this.service.generateWorkspaceEmbeddings(workspaceId);
    return res.status(200).json({ success: true, result });
  }

  async search(req: Request, res: Response) {
    const { workspaceId, query } = req.body;
    const result = await this.service.search(workspaceId, query);
    return res.status(200).json({ success: true, result });
  }
}
