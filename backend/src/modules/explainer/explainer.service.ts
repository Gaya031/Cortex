import { AIService } from "../ai/ai.service.js";
import { ArchitectureService } from "../architecture/architecture.serivce.js";
import { ChunkRepository } from "../chunk/chunk.repository.js";
import { ContextService } from "../context/context.service.js";
import { GraphqueryService } from "../graph-query/graph-query.service.js";
import { buildFileExplanationPrompt } from "../../shared/prompts/file-explainer.prompts.js";
import { buildProjectExplanationPrompt } from "../../shared/prompts/project-explainer.prompt.js";

export class ExplainerService {
  private readonly chunkRepository = new ChunkRepository();
  private readonly graphQueryService = new GraphqueryService();
  private readonly architectureService = new ArchitectureService();
  private readonly aiService = new AIService();
  private readonly contextService = new ContextService();

  async explainFile(workspaceId: string, filePath: string) {
    const chunks = await this.chunkRepository.findByFilePath(
      workspaceId,
      filePath,
    );

    const dependencies = await this.graphQueryService.getDependencies(
      workspaceId,
      filePath,
    );

    const dependents = await this.graphQueryService.getDependents(
      workspaceId,
      filePath,
    );

    return {
      file: filePath,
      chunks: chunks.map((chunk) => ({ name: chunk.name, type: chunk.type })),
      dependencies,
      dependents,
      metrics: {
        chunkCount: chunks.length,
        dependcyCount: dependencies.length,
        dependentCount: dependents.length,
      },
    };
  }

  async explainProject(workspaceId: string) {
    const summary =
      await this.architectureService.getArchitectureSummary(workspaceId);
    return summary;
  }

  async explainFileWithAI(workspaceId: string, filePath: string) {
    const fileSummary = await this.explainFile(workspaceId, filePath);
    const context = await this.contextService.buildProjectContext(workspaceId);
    const prompt = buildFileExplanationPrompt(fileSummary, context);
    const explanation = await this.aiService.generate(prompt);
    return {
      file: filePath,
      summary: fileSummary,
      explanation,
    };
  }

  async explainProjectWithAI(workspaceId: string) {
    const context = await this.contextService.buildProjectContext(workspaceId);
    const prompt = buildProjectExplanationPrompt(context);
    const explanation = await this.aiService.generate(prompt);
    return { context, explanation };
  }
}
