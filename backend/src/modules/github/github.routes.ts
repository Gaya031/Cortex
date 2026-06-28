import { Router } from "express";
import { GithubController } from "./github.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = Router();
const controller = new GithubController();

router.get("/repos", verifyToken, controller.listRepos.bind(controller));

export default router;
