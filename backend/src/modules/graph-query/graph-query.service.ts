import { GraphRepository } from "../graph/graph.repository.js";

export class GraphqueryService {
  private readonly graphRepository = new GraphRepository();

  async getDependencies(workspaceId: string, filePath: string) {
    const nodeId = `file:${filePath}`;
    const edges = await this.graphRepository.findOutgoingEdges(
      workspaceId,
      nodeId,
    );
    return edges
      .filter((edge) => edge.relation === "IMPORTS")
      .map((edge) => edge.target);
  }

  async getDependents(workspaceId: string, filePath: string) {
    const nodeId = `file:${filePath}`;
    const edges = await this.graphRepository.findIncomingEdges(
      workspaceId,
      nodeId,
    );
    return edges
      .filter((edge) => edge.relation === "IMPORTS")
      .map((edge) => edge.source);
  }
}
