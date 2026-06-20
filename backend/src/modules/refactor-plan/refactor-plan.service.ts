import { buildRefactorPlanPrompt, buildRepositoryContextPrompt } from "../../shared/prompts/refactor-plan.prompt.js";
import { parseAIJson } from "../../shared/utils/ai.utils.js";
import { AIService } from "../ai/ai.service.js";
import { ChangesetService } from "../changeset/changeset.service.js";
import { ContextService } from "../context/context.service.js";
import { IntelligenceService } from "../intelligence/intelligence.service.js";
import { TransformationService } from "../transformation/transformation.service.js";

export class RefactorPlanService {
  private readonly transformationService = new TransformationService();
  private readonly contextService = new ContextService();
  private readonly intelligenceService = new IntelligenceService();
  private readonly aiService = new AIService();
  private readonly changesetService = new ChangesetService();

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
    const cleaned = parseAIJson(response || "");
    if (!response) {
      throw new Error("AI service returned no response");
    }

    try {
      return JSON.parse(cleaned);
    } catch {
      return { raw: response };
    }
  }

  async generate(workspaceId: string, goal: string) {
    const repositoryContext = await this.contextService.buildQuestionContext(
      workspaceId,
      goal,
    );

    const prompt = buildRepositoryContextPrompt(repositoryContext, goal);

    const raw = (await this.aiService.generate(prompt));
    if (!raw) {
      throw new Error("AI service returned no response");
    }

    const cleaned = parseAIJson(raw);

    const plan = JSON.parse(cleaned);

    const changeSet = this.changesetService.buildFromPlan(plan);
    return { plan, changeSet };
  }
}
