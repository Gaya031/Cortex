import { AstRefactorService } from "../ast-refactor/ast-refactor.service.js";
import { IndexerService } from "../indexer/indexer.service.js";
import { RefactoerReviewService } from "../refactor-review/refactor-review.service.js";
import { SnapshotService } from "../snapshot/snapshot.service.js";

export class ChangeSetExecutorService {
  private readonly astRefactorService = new AstRefactorService();

  private readonly indexerService = new IndexerService();

  private readonly snapshotService = new SnapshotService();
  private readonly refactorReviewService = new RefactoerReviewService();

  async execute(workspaceId: string, changeSet: any) {
    let snapshot: any = null;

    try {
      //------------------ REVIEW PHASE  -------------------

      const review = await this.refactorReviewService.review(
        workspaceId,
        changeSet,
      );
      if (!review.validation.valid) {
        throw new Error(review.validation.errors.join(", "));
      }

      const highRiskOperation = review.risks.some(
        (risk) => risk.riskLevel === "HIGH",
      );
      if (highRiskOperation) {
        console.warn("High risk refactor detected", review.risks);
        return {
          review,
          blocked: true,
          reason: "High risk refactor.",
        };
      }

      //------------------ SNAPSHOT PHASE  -------------------

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

      //------------------ EXECUTION PHASE  -------------------

      for (const move of changeSet.moveFunctions ?? []) {
        const result = await this.astRefactorService.moveFunction(
          workspaceId,
          move.function,
          move.from,
          move.to,
        );

        results.push(result);
      }
      console.log("Starting execution...");
      for (const rename of changeSet.renameFunctions ?? []) {
        console.log(`Renaming ${rename.oldName} -> ${rename.newName}`);
        const result = await this.astRefactorService.renameFunction(
          workspaceId,
          rename.oldName,
          rename.newName,
        );

        results.push(result);
      }

      //------------------ REINDEX PHASE  -------------------
      console.log("Reindexing workspace...");
      const reindex = await this.indexerService.indexWorkspace(workspaceId);

      return {
        review,
        operations: results,
        reindex,
        snapshotId: snapshot?._id,
      };
    } catch (err) {
      //------------------ ROLLBACK PHASE  -------------------

      if (snapshot && snapshot._id) {
        await this.snapshotService.restoreSnapshot(String(snapshot._id));
      }

      throw err;
    }
  }
}
