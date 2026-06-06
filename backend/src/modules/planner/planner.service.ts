import { buildPlannerPrompt } from "../../shared/prompts/planner.prompt.js";
import { AIService } from "../ai/ai.service.js";
import { ContextService } from "../context/context.service.js";

export class PlannerService{
    private readonly contextService = new ContextService();
    private readonly aiService = new AIService();

    async generatePlan(workspaceId: string, goal: string){
        const context = await this.contextService.buildProjectContext(workspaceId);
        const prompt =  buildPlannerPrompt(goal, context);

        const response = await this.aiService.generate(prompt);

        try{
            if (!response || typeof response !== "string") return {raw: response};
            return JSON.parse(response as string);
        }catch{
            return {raw: response};
        }
    }
}