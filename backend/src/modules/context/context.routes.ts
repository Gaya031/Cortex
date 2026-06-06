import { Router } from "express";
import { ContextController } from "./context.controller.js";

const router = Router();
const controller = new ContextController();

router.get("/:workspaceId", controller.buildContext.bind(controller));

export default router;