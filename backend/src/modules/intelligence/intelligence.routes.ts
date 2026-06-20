import { Router } from "express";
import { IntelligenceController } from "./intelligence.controller.js";

const router = Router();
const controller = new IntelligenceController();

router.get("/risk/:workspaceId", controller.getRiskAnalysis.bind(controller));
router.get("/health/:workspaceId", controller.getHealthScore.bind(controller));
router.get(
  "/report/:workspaceId",
  controller.getRepositoryReport.bind(controller),
);
router.get("/review/:workspaceId", controller.getAIReview.bind(controller));
export default router;
