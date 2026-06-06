import { Router } from "express";
import { CallGraphController } from "./callgraph.controller.js";

const router = Router();

const controller = new CallGraphController();

router.get("/:workspaceId", controller.getGraph.bind(controller));

router.post("/impact", controller.getFunctionImpact.bind(controller));

export default router;
