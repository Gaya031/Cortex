import {Router} from 'express';
import { SnapshotController } from './snapshot.controller.js';

const router = Router();
const controller = new SnapshotController();


router.post("/create", controller.createSnapshot.bind(controller));

router.post("/restore/:snapshotId", controller.restoreSnapshot.bind(controller));

export default router;