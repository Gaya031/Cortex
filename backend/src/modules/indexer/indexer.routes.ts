import {Router} from "express";
import { IndexerService } from "./indexer.service.js";

const router = Router();

const indexerService = new IndexerService();

router.post("/:workspaceId", async (req, res) => {
    const result = await indexerService.indexWorkspace(req.params.workspaceId);
    return res.status(200).json({success: true, data: result})
})

export default router;