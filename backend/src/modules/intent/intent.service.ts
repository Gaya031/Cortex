import { AIService } from "../ai/ai.service.js";
import { ContextService } from "../context/context.service.js";
import { buildIntentPrompt } from "../../shared/prompts/intent.prompt.js";
import { IntelligenceService } from "../intelligence/intelligence.service.js";

export class IntentService {
  private readonly contextService = new ContextService();
  private readonly aiService = new AIService();
  private readonly intelligenceService = new IntelligenceService();

  private classifyIntent(goal: string) {
    const lower = goal.toLowerCase();
    if (lower.includes("scalability")) return "SCALABILITY";
    if (lower.includes("latency") || lower.includes("performance"))
      return "PERFORMANCE";
    if (lower.includes("maintain")) return "MAINTAINABILITY";
    if (lower.includes("technical debt")) return "TECH_DEBT";
    return "GENERAL";
  }
  async analyzeIntent(workspaceId: string, goal: string) {
    let parsed;
    const intentType = this.classifyIntent(goal);
    const context = await this.contextService.buildProjectContext(workspaceId);
    const intelligenceReport = await this.intelligenceService.generateReport(workspaceId);
    const prompt = buildIntentPrompt(goal, intelligenceReport);
    const response = await this.aiService.generate(prompt);
    try {
      parsed = typeof response === "string" ? JSON.parse(response) : { raw: response };
    } catch {
      parsed = { raw: response };
    }
    return { intentType, goal, analysis: parsed };
  }
}
