import { buildRefactorPlanPrompt } from "../../shared/prompts/refactor-plan.prompt.js";
import { AIService } from "../ai/ai.service.js";
import { ContextService } from "../context/context.service.js";
import { IntelligenceService } from "../intelligence/intelligence.service.js";
import { TransformationService } from "../transformation/transformation.service.js";

export class RefactorPlanService {
  private readonly transformationService = new TransformationService();
  private readonly contextService = new ContextService();
  private readonly intelligenceService = new IntelligenceService();
  private readonly aiService = new AIService();

  async generatePlan(workspaceId: string, filePath: string, objective: string) {
    const [transformationContext, projectContext, risks] = await Promise.all([
      this.transformationService.buildTransformationRepository(
        workspaceId,
        filePath,
      ),
      this.contextService.buildProjectContext(workspaceId),
      this.intelligenceService.getRiskAnalysis(workspaceId),
    ]);

    const fileRisk = risks.find((risk) => risk.file === filePath) ?? null;

    const prompt = buildRefactorPlanPrompt(
      objective,
      transformationContext,
      projectContext,
      fileRisk,
    );

    const response = await this.aiService.generate(prompt);

    if (!response) {
      throw new Error("AI service returned no response");
    }

    try {
      return JSON.parse(response);
    } catch {
      return { raw: response };
    }
  }
}
