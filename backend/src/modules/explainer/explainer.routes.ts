import { Router } from "express";
import { ExplainerController } from "./explainer.controller.js";

const router = Router();

const controller = new ExplainerController();

router.post("/file", controller.explainFile.bind(controller));
router.get("/project/:workspaceId", controller.explainProject.bind(controller));
router.post("/file-ai", controller.explainFileWithAI.bind(controller));
router.post("/project-ai", controller.explainProjectWithAI.bind(controller));

export default router;
