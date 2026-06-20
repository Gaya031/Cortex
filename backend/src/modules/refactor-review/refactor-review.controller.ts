import { Request, Response } from "express";
import { RefactoerReviewService } from "./refactor-review.service.js";

export class RefactorReviewController {
  private readonly service = new RefactoerReviewService();

  async review(req: Request, res: Response) {
    const { workspaceId, changeSet } = req.body;
    const result = await this.service.review(workspaceId, changeSet);

    return res.status(200).json({ success: true, result });
  }
}
