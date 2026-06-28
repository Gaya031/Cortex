import { GraphRepository } from "../graph/graph.repository.js";
import { GraphRelationType } from "../graph/graph.types.js";
import {
  fromFileNodeId,
  normalizeFilePath,
  toFileNodeId,
} from "../../shared/utils/path.util.js";

export class GraphqueryService {
  private readonly graphRepository = new GraphRepository();

  async getDependencies(workspaceId: string, filePath: string) {
    const nodeId = toFileNodeId(normalizeFilePath(filePath));
    const edges = await this.graphRepository.findOutgoingEdges(
      workspaceId,
      nodeId,
    );

    const dependencies = new Set<string>();

    for (const edge of edges) {
      if (edge.relation === GraphRelationType.FILE_IMPORTS_FILE) {
        dependencies.add(fromFileNodeId(edge.target));
      }
    }

    return [...dependencies].sort();
  }

  async getDependents(workspaceId: string, filePath: string) {
    const nodeId = toFileNodeId(normalizeFilePath(filePath));
    const edges = await this.graphRepository.findIncomingEdges(
      workspaceId,
      nodeId,
    );

    const dependents = new Set<string>();

    for (const edge of edges) {
      if (
        edge.relation === GraphRelationType.FILE_IMPORTS_FILE &&
        edge.source.startsWith("file:")
      ) {
        dependents.add(fromFileNodeId(edge.source));
      }
    }

    return [...dependents].sort();
  }

  async getExternalDependencies(workspaceId: string, filePath: string) {
    const nodeId = toFileNodeId(filePath);
    const edges = await this.graphRepository.findOutgoingEdges(
      workspaceId,
      nodeId,
    );

    return edges
      .filter((edge) => edge.relation === GraphRelationType.IMPORTS)
      .map((edge) => edge.target.replace(/^external:/, ""))
      .sort();
  }

  async getFileRelationshipSummary(workspaceId: string, filePath: string) {
    const normalizedPath = normalizeFilePath(filePath);
    const [dependencies, dependents, externalDependencies] =
      await Promise.all([
        this.getDependencies(workspaceId, normalizedPath),
        this.getDependents(workspaceId, normalizedPath),
        this.getExternalDependencies(workspaceId, normalizedPath),
      ]);

    return {
      file: normalizedPath,
      dependencies,
      dependents,
      externalDependencies,
    };
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
