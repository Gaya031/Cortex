import {Router} from "express";
import { IndexerService } from "./indexer.service.js";

const router = Router();

const indexerService = new IndexerService();

import { WorkspaceRepository } from "../workspace/workspace.repository.js";

router.post("/:workspaceId", async (req, res) => {
    const workspaceId = req.params.workspaceId;
    const workspaceRepository = new WorkspaceRepository();
    
    // Set to processing immediately
    await workspaceRepository.updateStatus(workspaceId, "PROCESSING");
    // setTimeInterval(() => {indexing in process}, 2000);
    // Background indexing
    indexerService.indexWorkspace(workspaceId)
        .then(() => {
            workspaceRepository.updateStatus(workspaceId, "READY")
            console.log("indexing done.");
        })
        .catch((err) => {
            console.error("Indexing failed:", err);
            workspaceRepository.updateStatus(workspaceId, "FAILED");
        });
        
    return res.status(200).json({success: true, message: "Indexing started in background"});
})

router.get("/stats/:workspaceId", async (req, res) => {
    const workspaceId = Array.isArray(req.params.workspaceId)
      ? req.params.workspaceId[0]
      : req.params.workspaceId;
    const stats = await indexerService.getWorkspaceStats(workspaceId);
    return res.status(200).json({ success: true, result: stats });
});

export default router;