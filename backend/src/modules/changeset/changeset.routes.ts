import {Router} from 'express';
import { ChangeSetController } from './changeset.controller.js';

const router = Router();

const controller = new ChangeSetController();

router.post("/generate", controller.generate.bind(controller));

export default router;