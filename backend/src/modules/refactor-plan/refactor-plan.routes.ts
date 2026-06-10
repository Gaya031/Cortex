import {Router} from 'express';
import { RefactorPlanController } from './refactor-plan.controller.js';

const router = Router();
const controller = new RefactorPlanController();

router.post("/generate", controller.generate.bind(controller));

export default router;