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
    const { workspaceId, filePath } = req.body;
    const dependencies = await this.graphqueryService.getDependencies(
      workspaceId,
      filePath,
    );
    res.json({ dependencies });
  }

  async dependents(req: Request, res: Response) {
    const { workspaceId, filePath } = req.body;
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
    const result = await this.graphService.getVisualizationGraph(workspaceId);
    return res.status(200).json({ result });
  }
}
