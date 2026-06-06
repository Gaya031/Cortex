import { Router } from "express";
import { FileController } from "./file.controller.js";

const router = Router();

const fileController =
  new FileController();

router.post(
  "/",
  fileController.create
);

router.get(
  "/workspace/:workspaceId",
  fileController.getWorkspaceFiles
);

export default router;