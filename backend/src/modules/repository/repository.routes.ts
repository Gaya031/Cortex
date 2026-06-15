import { Router } from "express";
import { RepositoryController } from "./repository.controller.js";

const router = Router();
const controller = new RepositoryController();

router.get("/tree/:workspaceId", controller.getTree.bind(controller));

export default router;
