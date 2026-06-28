import { AIService } from "../ai/ai.service.js";
import { ArchitectureService } from "../architecture/architecture.service.js";
import { ChunkRepository } from "../chunk/chunk.repository.js";
import { ContextService } from "../context/context.service.js";
import { GraphqueryService } from "../graph-query/graph-query.service.js";
import { buildFileExplanationPrompt } from "../../shared/prompts/file-explainer.prompts.js";
import { buildProjectExplanationPrompt } from "../../shared/prompts/project-explainer.prompt.js";
import { cache, cacheKeys } from "../../shared/redis/redis.js";

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

    const externalDependencies =
      await this.graphQueryService.getExternalDependencies(
        workspaceId,
        filePath,
      );

    return {
      file: filePath,
      chunks: chunks.map((chunk) => ({ name: chunk.name, type: chunk.type })),
      dependencies,
      dependents,
      externalDependencies,
      metrics: {
        chunkCount: chunks.length,
        dependcyCount: dependencies.length,
        dependentCount: dependents.length,
        externalDependencyCount: externalDependencies.length,
      },
    };
  }

  async explainProject(workspaceId: string) {
    const summary =
      await this.architectureService.getArchitectureSummary(workspaceId);
    return summary;
  }

  async explainFileWithAI(workspaceId: string, filePath: string) {
    const key = cacheKeys.aiFileExplanation(workspaceId, filePath);
    const cached = await cache.getJson<{
      file: string;
      summary: unknown;
      explanation: string | undefined;
    }>(key);

    if (cached) {
      return cached;
    }

    const fileSummary = await this.explainFile(workspaceId, filePath);
    const context = await this.contextService.buildProjectContext(workspaceId);
    const prompt = buildFileExplanationPrompt(fileSummary, context);
    const explanation = await this.aiService.generate(prompt);
    const result = {
      file: filePath,
      summary: fileSummary,
      explanation,
    };

    await cache.setJson(key, result, 60 * 60 * 6);

    return result;
  }

  async explainProjectWithAI(workspaceId: string) {
    const key = cacheKeys.aiProjectExplanation(workspaceId);
    const cached = await cache.getJson<{
      context: unknown;
      explanation: string | undefined;
    }>(key);

    if (cached) {
      return cached;
    }

    const context = await this.contextService.buildProjectContext(workspaceId);
    const prompt = buildProjectExplanationPrompt(context);
    const explanation = await this.aiService.generate(prompt);
    const result = { context, explanation };

    await cache.setJson(key, result, 60 * 60 * 6);

    return result;
  }
}
