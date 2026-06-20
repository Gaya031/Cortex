import { Request, Response } from "express";
import { ArchitectureService } from "./architecture.service.js";

export class ArchitectureController {
  private readonly architectureService = new ArchitectureService();

  async getCriticalFiles(req: Request, res: Response) {
    const rawWorkspaceId = req.params.workspaceId;
    const workspaceId = Array.isArray(rawWorkspaceId)
      ? rawWorkspaceId[0]
      : rawWorkspaceId;
    const result = await this.architectureService.getCriticalFile(workspaceId);
    res.json({ result });
  }

  async getOrphanFiles(req: Request, res: Response) {
    const rawWorkspaceId = req.params.workspaceId;
    const workspaceId = Array.isArray(rawWorkspaceId)
      ? rawWorkspaceId[0]
      : rawWorkspaceId;
    const result = await this.architectureService.getOrphanFiles(workspaceId);
    res.json({ result });
  }

  async getHighCouplingFiles(req: Request, res: Response) {
    const rawWorkspaceId = req.params.workspaceId;
    const workspaceId = Array.isArray(rawWorkspaceId)
      ? rawWorkspaceId[0]
      : rawWorkspaceId;
    const result =
      await this.architectureService.getHighglyCoupledFiles(workspaceId);
    res.json({ result });
  }

  async getSummary(req: Request, res: Response) {
    const rawWorkspaceId = req.params.workspaceId;
    const workspaceId = Array.isArray(rawWorkspaceId)
      ? rawWorkspaceId[0]
      : rawWorkspaceId;
    const result =
      await this.architectureService.getArchitectureSummary(workspaceId);
    res.json({ result });
  }

  async getImpactAnalysis(req: Request, res: Response) {
    const { workspaceId, filePath } = req.body;
    const result = await this.architectureService.getImpactAnalysis(
      workspaceId,
      filePath,
    );
    return res.status(200).json({ result });
  }
}
