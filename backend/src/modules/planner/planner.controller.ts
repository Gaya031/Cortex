import {Request, Response} from 'express';
import { PlannerService } from './planner.service.js';

export class PlannerController{
    private readonly plannerService = new PlannerService();

    async generatePlan(req: Request, res: Response){
        const {workspaceId, goal} = req.body;
        const result = await this.plannerService.generatePlan(workspaceId, goal);
        return res.status(200).json({result});
    }
}