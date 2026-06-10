import { Router } from "express";
import { EmbeddingController } from "./embedding.controller.js";

const router = Router();

const controller = new EmbeddingController();
router.post("/search", controller.search.bind(controller));
router.post("/:workspaceId", controller.generate.bind(controller));

export default router;
