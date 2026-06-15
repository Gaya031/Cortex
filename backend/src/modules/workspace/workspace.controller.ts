import { Request, Response } from "express";
import { pickFolder } from "./folder-picker.service.js";
import { WorkspaceService } from "./workspace.service.js";

const workspaceService = new WorkspaceService();

export class WorkspaceController {
  async create(req: Request, res: Response) {
    const payload = { ...req.body, userId: (req as any).user?.id };
    if (!payload.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const workspace = await workspaceService.createWorkspace(payload);
    return res.status(201).json({ success: true, data: workspace });
  }

  async getAll(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const workspaces = await workspaceService.getAllWorkspace(userId);
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

  async browseFolder(_req: Request, res: Response) {
    try {
      const result = await pickFolder();

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not open the folder picker.";

      return res.status(501).json({ success: false, message });
    }
  }

  async delete(req: Request, res: Response) {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
      await workspaceService.deleteWorkspace(id, userId);
      return res.status(200).json({ success: true, message: "Workspace deleted successfully" });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
