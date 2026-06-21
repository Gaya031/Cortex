import { api } from "../../store/api";
import {
  ArchitectureGraph,
  ArchitectureSummary,
  FunctionImpact,
} from "@/types/architecture.types";

interface RawCallGraphNode {
  id: string;
  name?: string;
  type?: string;
  filePath?: string;
}

interface RawCallGraphEdge {
  from: string;
  to: string;
}

function normalizeGraph(graph: ArchitectureGraph): ArchitectureGraph {
  return {
    nodes: (graph.nodes ?? []).map((node) => ({
      ...node,
      label: node.label ?? node.name ?? node.id,
      filePath: node.filePath ?? node.path,
      type: String(node.type ?? "UNKNOWN").toUpperCase(),
    })),
    edges: (graph.edges ?? []).map((edge, index) => ({
      id:
        edge.id ??
        `${edge.source ?? edge.from}-${edge.target ?? edge.to}-${index}`,
      source: edge.source ?? edge.from ?? "",
      target: edge.target ?? edge.to ?? "",
      relation: edge.relation,
    })),
  };
}

export const architectureApi = {
  async getDependenciesGraph(
    workspaceId: string,
  ): Promise<ArchitectureGraph> {
    const res = await api.get(
      `/graph/visual/${workspaceId}`,
    );
    return normalizeGraph(res.data.result);
  },

  async getProjectFlow(
    workspaceId: string,
  ): Promise<ArchitectureGraph> {
    const res = await api.get(
      `/graph/project-flow/${workspaceId}`,
    );

    return normalizeGraph(res.data.result);
  },

  async getCallGraph(
    workspaceId: string,
  ): Promise<ArchitectureGraph> {
    const res = await api.get(
      `/callgraph/${workspaceId}`,
    );

    const result = res.data.result as {
      nodes: RawCallGraphNode[];
      edges: RawCallGraphEdge[];
    };

    return normalizeGraph({
      nodes: result.nodes.map((node) => ({
        id: node.id,
        label: node.name,
        type: node.type ?? "FUNCTION",
        filePath: node.filePath,
      })),

      edges: result.edges.map((edge) => ({
        source: edge.from,
        target: edge.to,
        relation: "CALLS",
      })),
    });
  },

  async getSystemMap(
    workspaceId: string,
  ): Promise<ArchitectureGraph> {
    const [dependencies, callGraph, projectFlow] =
      await Promise.allSettled([
        this.getDependenciesGraph(workspaceId),
        this.getCallGraph(workspaceId),
        this.getProjectFlow(workspaceId),
      ]);

    const graphs = [dependencies, callGraph, projectFlow]
      .filter(
        (
          result,
        ): result is PromiseFulfilledResult<ArchitectureGraph> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);

    const nodes = new Map<string, ArchitectureGraph["nodes"][number]>();
    const edges = new Map<string, ArchitectureGraph["edges"][number]>();

    graphs.forEach((graph) => {
      graph.nodes.forEach((node) => {
        if (!nodes.has(node.id)) {
          nodes.set(node.id, node);
        }
      });

      graph.edges.forEach((edge) => {
        const key = `${edge.source}->${edge.target}:${edge.relation ?? "RELATES"}`;
        if (!edges.has(key)) {
          edges.set(key, {
            ...edge,
            id: key,
          });
        }
      });
    });

    return {
      nodes: Array.from(nodes.values()),
      edges: Array.from(edges.values()),
    };
  },

  async getSummary(
    workspaceId: string,
  ): Promise<ArchitectureSummary> {
    const res = await api.get(
      `/architecture/summary/${workspaceId}`,
    );

    return res.data.result;
  },

  async getImpact(
    workspaceId: string,
    functionId: string,
  ): Promise<FunctionImpact> {
    const res = await api.post(
      "/callgraph/impact",
      {
        workspaceId,
        functionId,
      },
    );

    return res.data.result;
  },
};
