import { Request, Response } from "express";
import { SnapshotService } from "./snapshot.service.js";
import { IndexerService } from "../indexer/indexer.service.js";

export class SnapshotController {
  private readonly service = new SnapshotService();
    
  async createSnapshot(req: Request, res: Response) {
    const { workspaceId, filePaths } = req.body;
    const result = await this.service.createSnapshot(workspaceId, filePaths as string[]);
    return res.status(200).json({ success: true, result });
  }

  async restoreSnapshot(req: Request, res: Response){
    const snapshotIdParam = req.params.snapshotId;
    const snapshotId = Array.isArray(snapshotIdParam) ? snapshotIdParam[0] : snapshotIdParam;
    const result = await this.service.restoreSnapshot(snapshotId);
    return res.status(200).json({success: true, result});
  }
}
