import { ArchitectureService } from "../architecture/architecture.serivce.js";
import { DecisionService } from "../decision/decision.service.js";
import { IntelligenceService } from "../intelligence/intelligence.service.js";

export class ContextService {
  private readonly architectureService = new ArchitectureService();
  private readonly decisionService = new DecisionService();
  private readonly intelligenceService = new IntelligenceService();

  async buildProjectContext(workspaceId: string) {
    const [architecture, decisions, risks] = await Promise.all([
      this.architectureService.getArchitectureSummary(workspaceId),
      this.decisionService.getWorkspaceDecisions(workspaceId),
      this.intelligenceService.getRiskAnalysis(workspaceId),
    ]);
    return { workspaceId, architecture, decisions, risks, generatedAt: new Date() };
  }
}
