import { Router } from "express";
import { DecisionController } from "./decision.controller.js";

const router = Router();
const controller = new DecisionController();

router.post("/", controller.createDecision.bind(controller));
router.get("/:workspaceId", controller.getDecision.bind(controller));

export default router;
