import { AstRefactorService } from "../ast-refactor/ast-refactor.service.js";
import { IndexerService } from "../indexer/indexer.service.js";
import { SnapshotService } from "../snapshot/snapshot.service.js";

export class ChangeSetExecutorService {
  private readonly astRefactorService = new AstRefactorService();

  private readonly indexerService = new IndexerService();

  private readonly snapshotService = new SnapshotService();

  async execute(workspaceId: string, changeSet: any) {
    let snapshot: any = null;

    try {
      const results = [];

      const hasRenameOperations = (changeSet.renameFunctions ?? []).length > 0;

      if (hasRenameOperations) {
        snapshot =
          await this.snapshotService.createWorkspaceSnapshot(workspaceId);
      } else {
        const affectedFiles = new Set<string>();

        for (const move of changeSet.moveFunctions ?? []) {
          affectedFiles.add(move.from);

          affectedFiles.add(move.to);
        }

        snapshot = await this.snapshotService.createSnapshot(
          workspaceId,
          Array.from(affectedFiles),
        );
      }

      for (const move of changeSet.moveFunctions ?? []) {
        const result = await this.astRefactorService.moveFunction(
          workspaceId,
          move.function,
          move.from,
          move.to,
        );

        results.push(result);
      }

      for (const rename of changeSet.renameFunctions ?? []) {
        const result = await this.astRefactorService.renameFunction(
          workspaceId,
          rename.oldName,
          rename.newName,
        );

        results.push(result);
      }

      const reindex = await this.indexerService.indexWorkspace(workspaceId);

      return {
        operations: results,
        reindex,
        snapshotId: snapshot?._id,
      };
    } catch (err) {
      if (snapshot && snapshot._id) {
        await this.snapshotService.restoreSnapshot(String(snapshot._id));
      }

      throw err;
    }
  }
}
