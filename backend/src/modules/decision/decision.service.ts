import { DecisionRepository } from "./decision.repository.js";

export class DecisionService {
  private readonly repository = new DecisionRepository();

  async createDecision(data: any) {
    const existingDecision = await this.repository.findByWorkspace(
      data.workspaceId,
    );
    for (const existing of existingDecision) {
      const hasConflict = this.checkConflict(data.title, existing.title);
      if (hasConflict) {
        return {
          success: false,
          conflict: true,
          conflictingDecision: {
            id: existing._id,
            title: existing.title,
            reasoning: existing.reasoning,
          },
        };
      }
    }
    const decision = await this.repository.create(data);
    return {
      success: true,
      conflict: false,
      decision,
    };
  }

  async getWorkspaceDecisions(workspaceId: string) {
    return this.repository.findByWorkspace(workspaceId);
  }

  private checkConflict(title: string, existingTitle: string): boolean {
    const normalizedNew = title.toLowerCase();
    const normalizedExisting = existingTitle.toLowerCase();
    const opposites: Array<[string, string]> = [
      ["use", "avoid"],
      ["add", "remove"],
      ["enable", "disable"],
      ["monolith", "microservice"],
    ];

    for (const [a, b] of opposites) {
      const first = normalizedNew.includes(a) && normalizedExisting.includes(b);
      const second =
        normalizedNew.includes(b) && normalizedExisting.includes(a);
      if (first || second) return true;
    }
    return false;
  }
}
