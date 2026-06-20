import { ArchitectureService } from "../architecture/architecture.service.js";
import { DecisionService } from "../decision/decision.service.js";
import { EmbeddingService } from "../embedding/embedding.service.js";
import { IntelligenceService } from "../intelligence/intelligence.service.js";
import { RepositoryContext } from "./context.types.js";

export class ContextService {
  private readonly architectureService = new ArchitectureService();
  private readonly decisionService = new DecisionService();
  // private readonly intelligenceService = new IntelligenceService();
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

  // async buildQuestionContext(
  //   workspaceId: string,
  //   query: string,
  // ): Promise<RepositoryContext> {
  //   const chunks = (
  //     await this.embeddingService.search(workspaceId, query, 10)
  //   ).filter((chunk) => chunk.score > 0.45).slice(0, 5);
  //   const context = chunks
  //     .map((chunk) => `File: ${chunk.filePath} ${chunk.content}`)
  //     .join("\n-------------------\n");
  //   return { query, context, chunks };
  // }

  async buildQuestionContext(
    workspaceId: string,
    query: string,
  ): Promise<RepositoryContext> {
    const [chunks, architecture] = await Promise.all([
      this.embeddingService.search(workspaceId, query, 10),
      this.architectureService.getArchitectureSummary(workspaceId),
    ]);

    const filteredChunks = chunks
      .filter((chunk) => chunk.score > 0.45)
      .slice(0, 5);

    const context = `
Architecture:
${JSON.stringify(architecture)}

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
