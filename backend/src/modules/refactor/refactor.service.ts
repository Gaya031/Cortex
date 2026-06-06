import { buildRefactorPrompt } from "../../shared/prompts/refactor.prompt.js";
import { AIService } from "../ai/ai.service.js";
import { ContextService } from "../context/context.service.js";
import { ExplainerService } from "../explainer/explainer.service.js";
import { IntelligenceService } from "../intelligence/intelligence.service.js";

export class RefactorService {
  private readonly explainerService = new ExplainerService();
  private readonly contextService = new ContextService();
  private readonly intelligenceService = new IntelligenceService();
  private readonly aiService = new AIService();

  async recommendRefactor(workspaceId: string, filePath: string) {
    const [fileSummary, projectContext, risks] = await Promise.all([
      this.explainerService.explainFile(workspaceId, filePath),
      this.contextService.buildProjectContext(workspaceId),
      this.intelligenceService.getRiskAnalysis(workspaceId),
    ]);

    const fileRisk = risks.find((risk) => risk.file === filePath) ?? null;

    const prompt = buildRefactorPrompt(fileSummary, projectContext, fileRisk);

    const response = await this.aiService.generate(prompt);

    try {
      return JSON.parse(response ?? "");
    } catch {
      return {
        raw: response,
      };
    }
  }
}
