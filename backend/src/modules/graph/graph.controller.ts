import { Request, Response } from "express";
import { GraphService } from "./graph.service.js";
import { GraphqueryService } from "../graph-query/graph-query.service.js";

export class GraphController {
  private readonly graphService = new GraphService();
  private readonly graphqueryService = new GraphqueryService();

  async test(req: Request, res: Response) {
    const { workspaceId, filePath, chunks } = req.body;
    const graph = this.graphService.buildGraph(workspaceId, filePath, chunks);
    res.json(graph);
  }

  async dependencies(req: Request, res: Response) {
    const workspaceId = String(req.query.workspaceId);
    const filePath = String(req.query.filePath);

    const dependencies = await this.graphqueryService.getDependencies(
      workspaceId,
      filePath,
    );
    res.json({ dependencies });
  }

  async dependents(req: Request, res: Response) {
    const workspaceId = String(req.query.workspaceId);
    const filePath = String(req.query.filePath);

    const dependents = await this.graphqueryService.getDependents(
      workspaceId,
      filePath,
    );
    res.json({ dependents });
  }

  async visual(req: Request, res: Response) {
    const rawWorkspaceId = req.params.workspaceId;
    const workspaceId = Array.isArray(rawWorkspaceId)
      ? rawWorkspaceId[0]
      : rawWorkspaceId;
    if (!workspaceId) {
      return res.status(400).json({ error: "workspaceId is required" });
    }
    const mode = req.query.mode === "full" ? "full" : "files";
    const result = await this.graphService.getVisualizationGraph(
      workspaceId,
      mode,
    );
    return res.status(200).json({ result });
  }

  async projectFlow(req: Request, res: Response) {
    const rawWorkspaceId = req.params.workspaceId;
    const workspaceId = Array.isArray(rawWorkspaceId)
      ? rawWorkspaceId[0]
      : rawWorkspaceId;
    if (!workspaceId) {
      return res.status(400).json({ error: "workspaceId is required" });
    }
    const result = await this.graphService.getExecutionFlowGraph(workspaceId);
    return res.status(200).json({ result });
  }

  async functionCalls(req: Request, res: Response) {
    const workspaceId = String(req.query.workspaceId);
    const functionNodeId = String(req.query.functionNodeId);

    const result = await this.graphqueryService.getFunctionCalls(
      workspaceId,
      functionNodeId,
    );

    return res.status(200).json({ result });
  }

  async functionCallers(req: Request, res: Response) {
    const workspaceId = String(req.query.workspaceId);
    const functionNodeId = String(req.query.functionNodeId);

    const result = await this.graphqueryService.getFunctionCallers(
      workspaceId,
      functionNodeId,
    );

    return res.status(200).json({ result });
  }
}
