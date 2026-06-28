import { CallgraphService } from "../callgraph/callgraph.service.js";
import { ChangeSet } from "../changeset/changeset.types.js";
import { ChunkRepository } from "../chunk/chunk.repository.js";
import { RiskService } from "../risk/risk.service.js";
import { ValidationService } from "../validation/validation.service.js";
import { buildChunkNodeId } from "../../shared/utils/chunk-node.util.js";

export class RefactoerReviewService {
  private readonly validationService = new ValidationService();
  private readonly chunkRepository = new ChunkRepository();
  private readonly callgraphService = new CallgraphService();
  private readonly riskService = new RiskService();

  async review(workspaceId: string, changeSet: ChangeSet) {
    const validation = await this.validationService.validateChangeSet(
      workspaceId,
      changeSet,
    );
    const chunks = await this.chunkRepository.findByWorkspace(workspaceId);

    const impacts = [];
    const risks = [];

    for (const rename of changeSet.renameFunctions ?? []) {
      const chunk = chunks.find((c) => c.name === rename.oldName);
      if (!chunk) continue;

      const functionId = buildChunkNodeId(chunk);

      const impact = await this.callgraphService.getFunctionImpact(
        workspaceId,
        functionId,
      );

      const risk = await this.riskService.analyzeFunctionRisk(
        workspaceId,
        functionId,
      );

      impacts.push(impact);
      risks.push(risk);
    }

    for (const move of changeSet.moveFunctions ?? []) {
      const chunk = chunks.find(
        (c) => c.name === move.function && c.filePath === move.from,
      );
      if (!chunk) continue;
      const functionId = buildChunkNodeId(chunk);

      const impact = await this.callgraphService.getFunctionImpact(
        workspaceId,
        functionId,
      );
      const risk = await this.riskService.analyzeFunctionRisk(
        workspaceId,
        functionId,
      );
      impacts.push(impact);
      risks.push(risk);
    }
    const recommended = risks.every((risk) => risk.riskLevel !== "HIGH");
    return {
      validation,
      impacts,
      risks,
      safeToExecute: validation.valid,
      recommended
    };
  }
}
