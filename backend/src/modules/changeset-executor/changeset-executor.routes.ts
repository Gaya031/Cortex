import {Router} from 'express';
import { ChangeSetController } from '../changeset/changeset.controller.js';
import { ChangeSetExectorController } from './changeset-executor.controller.js';

const router = Router();

const controller = new ChangeSetExectorController();

router.post("/execute", controller.execute.bind(controller));

export default router;