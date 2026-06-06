import { Request, Response } from "express";

import { ContextService } from "./context.service.js";

export class ContextController {
  private readonly contextService = new ContextService();

  async buildContext(req: Request, res: Response) {
    const workspaceId = Array.isArray(req.params.workspaceId)
      ? req.params.workspaceId[0]
      : req.params.workspaceId;
    const result = await this.contextService.buildProjectContext(workspaceId);
    console.log(result);

    return res.json({ success: true, result });
  }
}
