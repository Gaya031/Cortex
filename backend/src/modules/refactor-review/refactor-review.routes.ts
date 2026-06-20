import {Router} from "express";
import { RefactorReviewController } from "./refactor-review.controller.js";

const router = Router();

const controller = new RefactorReviewController();

router.post("/", controller.review.bind(controller));

export default router;