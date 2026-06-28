import { Router } from "express";
import { FlowExplainerController } from "./flow-explainer.controller.js";

const router = Router();
const controller = new FlowExplainerController();

router.post("/explain", controller.explain.bind(controller));

export default router;
