import {Request, Response} from "express";
import { TransformationService } from "./transformation.service.js";

export class TransformationController{
    private readonly transformationService = new TransformationService();

    async getContext(req: Request, res: Response){
        const {workspaceId, filePath} = req.body;
        const result = await this.transformationService.buildTransformationRepository(workspaceId, filePath);

        res.status(200).json({success: true, result});
    }
}