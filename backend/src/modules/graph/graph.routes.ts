import { Router } from "express";
import { GraphController } from "./graph.controller.js";

const router = Router();
const controller = new GraphController();

router.post("/test", controller.test.bind(controller));

router.get("/dependencies", controller.dependencies.bind(controller));

router.get("/dependents", controller.dependents.bind(controller));

router.get("/function-calls", controller.functionCalls.bind(controller));
router.get("/function-callers", controller.functionCallers.bind(controller));

router.get("/visual/:workspaceId", controller.visual.bind(controller));

router.get(
  "/project-flow/:workspaceId",
  controller.projectFlow.bind(controller),
);

export default router;
