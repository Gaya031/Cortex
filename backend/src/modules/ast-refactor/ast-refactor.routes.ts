import {Router} from 'express';
import { AstRefactorController } from './ast-refactor.controller.js';

const router = Router();

const controller = new AstRefactorController();

router.post("/move-function", controller.moveFunction.bind(controller));

export default router;