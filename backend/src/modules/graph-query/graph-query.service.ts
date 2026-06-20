import { GraphRepository } from "../graph/graph.repository.js";
import { GraphRelationType } from "../graph/graph.types.js";

export class GraphqueryService {
  private readonly graphRepository = new GraphRepository();

  async getDependencies(workspaceId: string, filePath: string) {
    const nodeId = `file:${filePath}`;
    const edges = await this.graphRepository.findOutgoingEdges(
      workspaceId,
      nodeId,
    );
    return edges
      .filter((edge) => edge.relation === GraphRelationType.FILE_IMPORTS_FILE)
      .map((edge) => edge.target.replace("file:", ""));
  }

  async getDependents(workspaceId: string, filePath: string) {
    const nodeId = `file:${filePath}`;
    const edges = await this.graphRepository.findIncomingEdges(
      workspaceId,
      nodeId,
    );
    return edges
      .filter((edge) => edge.relation === GraphRelationType.FILE_IMPORTS_FILE)
      .map((edge) => edge.source.replace("file:", ""));
  }

  async getFunctionCalls(workspaceId: string, functionNodeId: string) {
    const edges = await this.graphRepository.findOutgoingEdges(
      workspaceId,
      functionNodeId,
    );
    return edges
      .filter((edge) => edge.relation === GraphRelationType.CALLS)
      .map((edge) => edge.target);
  }

  async getFunctionCallers(workspaceId: string, functionNodeId: string) {
    const edges = await this.graphRepository.findIncomingEdges(
      workspaceId,
      functionNodeId,
    );
    return edges
      .filter((edge) => edge.relation === GraphRelationType.CALLS)
      .map((edge) => edge.source);
  }
}
