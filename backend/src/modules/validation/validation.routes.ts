import {Router} from 'express';
import { ValidationController } from './validation.controller.js';

const router = Router();
const controller = new ValidationController();

router.post("/changeset", controller.validateChangeSet.bind(controller));

export default router;