import { Request, Response } from "express";
import { ChangesetService } from "./changeset.service.js";

export class ChangeSetController {
  private readonly service = new ChangesetService();

  async generate(req: Request, res: Response) {
    const plan = req.body;
    const result = this.service.generateChangeSet(plan);
    res.status(200).json({ success: true, result });
  }

  async buildFromPlan(req: Request, res: Response) {
    const plan = req.body;
    const result = this.service.buildFromPlan(plan);
    res.status(200).json({ success: true, result });
  }
}
