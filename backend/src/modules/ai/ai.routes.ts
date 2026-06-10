import { Router } from "express";
import { AIController } from "./ai.controller.js";

const router = Router();

const controller = new AIController();

router.post("/repository-question", controller.askRepository.bind(controller));

export default router;
