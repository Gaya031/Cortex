import {Router} from "express";
import { IntelligenceController } from "./intelligence.controller.js";

const router = Router();
const controller = new IntelligenceController();

router.get("/risk/:workspaceId", controller.getRiskAnalysis.bind(controller));

export default router;