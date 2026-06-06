import {Router} from 'express';
import { RefactorController } from './refactor.controller.js';

const router = Router();
const controller = new RefactorController();

router.post("/recommend", controller.recommend.bind(controller));

export default router;
