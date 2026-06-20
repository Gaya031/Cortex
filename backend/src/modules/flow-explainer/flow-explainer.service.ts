import { CallgraphService } from "../callgraph/callgraph.service.js";
import { FlowPath } from "./flow-explainer.types.js";

export class FlowExlainerService {
  private readonly callgraphService = new CallgraphService();

  async explainFunctionFlow(workspaceId: string, functionName: string) {
    const graph = await this.callgraphService.buildCallGraph(workspaceId);

    const targetNode = graph.nodes.find(
      (node) => node.name.toLowerCase() === functionName.toLowerCase(),
    );

    if (!targetNode) return null;

    const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));

    const reverseGraph = new Map<string, string[]>();

    for (const edge of graph.edges) {
      if (!reverseGraph.has(edge.to)) {
        reverseGraph.set(edge.to, []);
      }
      reverseGraph.get(edge.to)!.push(edge.from);
    }

    const MAX_PATHS = 50;

    const paths: { ids: string[]; cycle: boolean }[] = [];

    const dfs = (
      nodeId: string,
      currentPath: string[],
      visited: Set<string>,
    ) => {
      if (paths.length >= MAX_PATHS) return;

      if (visited.has(nodeId)) {
        paths.push({
          ids: [...currentPath, nodeId],
          cycle: true,
        });
        return;
      }

      const nextVisited = new Set(visited);
      nextVisited.add(nodeId);

      const callers = reverseGraph.get(nodeId);

      if (!callers || callers.length === 0) {
        paths.push({
          ids: [nodeId, ...currentPath],
          cycle: false,
        });
        return;
      }

      for (const caller of callers) {
        dfs(caller, [nodeId, ...currentPath], nextVisited);
      }
    };

    dfs(targetNode.id, [], new Set());

    const uniquePaths = new Map<
      string,
      {
        ids: string[];
        cycle: boolean;
      }
    >();

    for (const path of paths) {
      const key = path.ids.join("->") + `:${path.cycle}`;

      if (!uniquePaths.has(key)) {
        uniquePaths.set(key, path);
      }
    }

    const mappedPaths: FlowPath[] = [...uniquePaths.values()].map((path) => ({
      cycle: path.cycle,

      path: path.ids.map((id) => {
        const node = nodeMap.get(id);

        return {
          id,
          name: node?.name ?? id,
          filePath: node?.filePath ?? "",
        };
      }),
    }));

    const impactedNodes = new Set<string>();
    for (const path of mappedPaths) {
      path.path.forEach((node) => {
        if (node.id !== targetNode.id) {
          impactedNodes.add(node.id);
        }
      });
    }

    return {
      target: targetNode.name,
      totalPaths: mappedPaths.length,
      impactScore: impactedNodes.size,
      paths: mappedPaths,
    };
  }
}
