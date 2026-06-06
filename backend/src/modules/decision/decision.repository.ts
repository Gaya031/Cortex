import { DecisionModel } from "./decision.model.js";

export class DecisionRepository {
  async create(decision: any) {
    return DecisionModel.create(decision);
  }
  
  async findByWorkspace(workspaceId: string) {
    return DecisionModel.find({ workspaceId }).sort({
      importance: -1,
      createdAt: -1,
    });
  }
}
