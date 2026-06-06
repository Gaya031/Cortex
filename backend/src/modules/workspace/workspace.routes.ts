import { Router } from "express";
import { WorkspaceController } from "./workspace.controller.js";

const router = Router();

const workspaceController = new WorkspaceController();

router.post("/", workspaceController.create);
router.get("/", workspaceController.getAll);
router.get("/:id", workspaceController.getById);

export default router;