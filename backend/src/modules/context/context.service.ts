import { ArchitectureService } from "../architecture/architecture.service.js";
import { DecisionService } from "../decision/decision.service.js";
import { EmbeddingService } from "../embedding/embedding.service.js";
import { IntelligenceService } from "../intelligence/intelligence.service.js";
import { RepositoryContext } from "./context.types.js";

export class ContextService {
  private readonly architectureService = new ArchitectureService();
  private readonly decisionService = new DecisionService();
  private readonly embeddingService = new EmbeddingService();

  async buildProjectContext(workspaceId: string) {
    const intelligenceService = new IntelligenceService();
    const [architecture, decisions, risks] = await Promise.all([
      this.architectureService.getArchitectureSummary(workspaceId),
      this.decisionService.getWorkspaceDecisions(workspaceId),
      intelligenceService.getRiskAnalysis(workspaceId),
    ]);
    return {
      workspaceId,
      architecture,
      decisions,
      risks,
      generatedAt: new Date(),
    };
  }

  async buildQuestionContext(
    workspaceId: string,
    query: string,
  ): Promise<RepositoryContext> {
    const [chunks, architecture, decisions] = await Promise.all([
      this.embeddingService.search(workspaceId, query, 15),
      this.architectureService.getArchitectureSummary(workspaceId),
      this.decisionService.getWorkspaceDecisions(workspaceId),
    ]);

    const filteredChunks = chunks
      .filter((chunk) => chunk.score > 0.35)
      .slice(0, 10);

    const decisionContext = decisions
      .slice(0, 8)
      .map(
        (d: { title: string; reasoning: string; tags?: string[] }) =>
          `- ${d.title}: ${d.reasoning}${d.tags?.length ? ` [${d.tags.join(", ")}]` : ""}`,
      )
      .join("\n");

    const context = `
Architecture:
${JSON.stringify(architecture)}

Recorded Decisions:
${decisionContext || "None recorded yet."}

Repository Chunks:
${filteredChunks
  .map(
    (chunk) =>
      `File: ${chunk.filePath}
${chunk.content}`,
  )
  .join("\n-----------------\n")}
`;

    return {
      query,
      context,
      chunks: filteredChunks,
    };
  }
}
