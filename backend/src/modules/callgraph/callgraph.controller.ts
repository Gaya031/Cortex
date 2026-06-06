import { Request, Response } from "express";
import { CallgraphService } from "./callgraph.service.js";

export class CallGraphController {
  private readonly callgraphService = new CallgraphService();
  async getGraph(req: Request, res: Response) {
    const rawworkspaceId = req.params.workspaceId;
    const workspaceId = Array.isArray(rawworkspaceId)
      ? rawworkspaceId[0]
      : rawworkspaceId;
    const result = await this.callgraphService.buildCallGraph(workspaceId);
    res.status(200).json({ success: true, result });
  }
  async getFunctionImpact(req: Request, res: Response) {
    const { workspaceId, functionName } = req.body;
    const result = await this.callgraphService.getFunctionImpact(
      workspaceId,
      functionName,
    );
    res.status(200).json({ success: true, result });
  }
}
