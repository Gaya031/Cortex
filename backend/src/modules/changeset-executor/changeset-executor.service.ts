import { AstRefactorService } from "../ast-refactor/ast-refactor.service.js";
import { IndexerService } from "../indexer/indexer.service.js";

export class ChangeSetExecutorService {
  private readonly astRefactorService = new AstRefactorService();
  private readonly indexerService = new IndexerService();

  async execute(workspaceId: string, changeSet: any) {
    const results = [];
    for (const move of changeSet.moveFunctions ?? []) {
      const result = await this.astRefactorService.moveFunction(
        workspaceId,
        move.function,
        move.from,
        move.to,
      );
      results.push(result);
    }

    const reindex = await this.indexerService.indexWorkspace(workspaceId);
    return { operations: results, reindex };
  }
}
