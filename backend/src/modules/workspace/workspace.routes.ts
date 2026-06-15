import { Router } from "express";
import { WorkspaceController } from "./workspace.controller.js";

const router = Router();

const workspaceController = new WorkspaceController();

router.post("/", workspaceController.create);
router.get("/", workspaceController.getAll);
router.get("/browse-folder", workspaceController.browseFolder);
router.get("/:id", workspaceController.getById);
router.delete("/:id", workspaceController.delete);

export default router;
