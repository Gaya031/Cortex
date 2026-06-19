import {Router} from 'express';
import { FlowExplainerController } from './flow-explainer.controller.js';

const router = Router();
const controller = new FlowExplainerController();

router.get("/explain" , controller.explain.bind(controller));

export default router;