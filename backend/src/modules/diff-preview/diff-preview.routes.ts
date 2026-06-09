import {Router} from "express";
import { DiffPreviewController } from "./diff-preview.controller.js";

const router = Router();
const controller = new DiffPreviewController();

router.post("/move-function", controller.previewMoveFunction.bind(controller));

router.post("/rename-function", controller.previewRenameFunction.bind(controller));

export default router;

