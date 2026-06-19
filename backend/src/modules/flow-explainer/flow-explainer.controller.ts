import { Request, Response } from "express";
import { FlowExlainerService } from "./flow-explainer.service.js";

export class FlowExplainerController {
  private readonly service = new FlowExlainerService();

  async explain(req: Request, res: Response) {
    const { workspaceId, functionName } = req.body;

    const result = await this.service.explainFunctionFlow(
      workspaceId,
      functionName,
    );

    res.status(200).json({
      success: true,
      result,
    });
  }
}
