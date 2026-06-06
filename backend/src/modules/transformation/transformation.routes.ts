import {Router} from 'express';
import { TransformationController } from './transformation.controller.js';

const router = Router();

const controller = new TransformationController();

router.post("/context", controller.getContext.bind(controller));

export default router;