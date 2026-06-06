import { Router } from "express";
import { IntentController } from "./intent.controller.js";

const router = Router();
const controller = new IntentController();

router.post("/analyze", controller.analyzeIntent.bind(controller));

export default router;
