import { ChunkRepository } from "../chunk/chunk.repository.js";
import { ChunkType } from "../chunk/chunk.types.js";
import { GraphqueryService } from "../graph-query/graph-query.service.js";

export class TransformationService {
  private readonly chunkRepository = new ChunkRepository();
  private readonly graphqueryService = new GraphqueryService();

  async buildTransformationRepository(workspaceId: string, filePath: string) {
    const chunks = await this.chunkRepository.findByFilePath(
      workspaceId,
      filePath,
    );

    const dependencies = await this.graphqueryService.getDependencies(
      workspaceId,
      filePath,
    );

    return {
      file: filePath,
      functions: chunks
        .filter((c) => c.type === ChunkType.FUNCTION || c.type === ChunkType.METHOD)
        .map((c) => ({
          name: c.name,
          parameters: c.parameters ?? [],
          returnType: c.returnType,
          calls: c.calls ?? [],
          parentClass: c.parentChunk,
          content: c.content,
          startLine: c.startLine,
          endLine: c.endLine,
        })),
      components: chunks
        .filter((c) => c.type === ChunkType.COMPONENT)
        .map((c) => ({
          name: c.name,
          parameters: c.parameters ?? [],
          returnType: c.returnType,
          calls: c.calls ?? [],
          parentClass: c.parentChunk,
          content: c.content,
          startLine: c.startLine,
          endLine: c.endLine,
        })),
      classes: chunks
        .filter((c) => c.type === ChunkType.CLASS)
        .map((c) => ({
          name: c.name,
        })),
      imports: [...new Set(chunks.flatMap((c) => c.imports))],
      exports: [...new Set(chunks.flatMap((c) => c.exports))],
      dependencies,
    };
  }
}
