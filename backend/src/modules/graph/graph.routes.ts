import { Router } from "express";
import { GraphController } from "./graph.controller.js";

const router = Router();
const controller = new GraphController();

router.post("/test", controller.test.bind(controller));

router.get("/dependencies", controller.dependencies.bind(controller));

router.get("/dependents", controller.dependents.bind(controller));

router.get("/visual/:workspaceId", controller.visual.bind(controller));

export default router;
