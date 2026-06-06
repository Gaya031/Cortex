import { Router } from "express";
import { ArchitectureController } from "./architecture.controller.js";

const router = Router();
const controller = new ArchitectureController();

router.get(
  "/critical-files/:workspaceId",
  controller.getCriticalFiles.bind(controller),
);

router.get(
  "/orphan-files/:workspaceId",
  controller.getOrphanFiles.bind(controller),
);

router.get(
  "/high-coupling/:workspaceId",
  controller.getHighCouplingFiles.bind(controller),
);

router.get("/summary/:workspaceId", controller.getSummary.bind(controller));

router.post("/impact", controller.getImpactAnalysis.bind(controller));

export default router;
