import { Request, Response } from "express";
import { WorkspaceService } from "./workspace.service.js";

const workspaceService = new WorkspaceService();

export class WorkspaceController {
  async create(req: Request, res: Response) {
    const workspace = await workspaceService.createWorkspace(req.body);
    return res.status(201).json({ success: true, data: workspace });
  }

  async getAll(_req: Request, res: Response) {
    const workspaces = await workspaceService.getAllWorkspace();
    return res.status(200).json({ success: true, data: workspaces });
  }

  async getById(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const workspace = await workspaceService.getWorkspaceById(id);
    if (!workspace) {
      return res
        .status(404)
        .json({ success: false, message: "Workspace not found" });
    }
    return res.status(200).json({ success: true, data: workspace });
  }
}
