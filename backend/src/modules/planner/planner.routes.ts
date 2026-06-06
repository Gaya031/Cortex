import {Router} from 'express';
import { PlannerController } from './planner.controller.js';

const router = Router();

const controller = new PlannerController();

router.post("/generate", controller.generatePlan.bind(controller));

export default router;