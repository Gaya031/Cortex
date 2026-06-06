import { Router } from "express";
import { ChunkService } from "./chunk.service.js";

const router = Router();

const chunkService = new ChunkService();

router.post("/test", (req, res) => {
  const { workspaceId, filePath, code } = req.body;

  const chunks = chunkService.generateChunks(workspaceId, filePath, code);

  return res.status(200).json({
    success: true,
    chunks,
  });
});

export default router;
