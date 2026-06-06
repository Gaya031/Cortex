import { RefactorPlan } from "../refactor-plan/refactor-plan.types.js";

export class ChangesetService {
  generateChangeSet(plan: RefactorPlan) {
    const createFiles = [...plan.newFiles];
    const moveFunctions: {
      function: string;
      from: string;
      to: string;
    }[] = [];
    const updateImports = new Map<string, { file: string; reason: string }>();

    for (const move of plan.moves) {
      for (const fn of move.functions) {
        moveFunctions.push({
          function: fn,
          from: move.from,
          to: move.to,
        });
      }
      updateImports.set(move.from, {
        file: move.from,
        reason: "Functions moved to another file",
      });
    }
    return {
      createFiles,
      moveFunctions,
      updateImports: Array.from(updateImports.values()),
      warnings: [],
    };
  }
}
