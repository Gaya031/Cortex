import { ChunkRepository } from "../chunk/chunk.repository.js";

export class CallgraphService {
  private readonly chunkRepository = new ChunkRepository();

  async buildCallGraph(workspaceId: string) {
    const chunks = await this.chunkRepository.findByWorkspace(workspaceId);
    // const graph = [];
    // for (const chunk of chunks) {
    //   for (const call of chunk.calls ?? []) {
    //     graph.push({ from: chunk.name, to: call });
    //   }
    // }
    // return graph;

    const nodes = chunks.map((chunk) => ({
      id: `${chunk.filePath}:${chunk.name}`,
      name: chunk.name,
      filePath: chunk.filePath,
      type: chunk.type,
    }));

    const functionMap = new Map();

    for (const chunk of chunks) {
      functionMap.set(chunk.name, `${chunk.filePath}:${chunk.name}`);
    }
    const edges = [];
    for (const chunk of chunks) {
      for (const calledFunction of chunk.calls ?? []) {
        const target = functionMap.get(calledFunction);
        if (!target) continue;
        edges.push({
          from: `${chunk.filePath}:${chunk.name}`,
          to: target,
        });
      }
    }
    return { nodes, edges };
  }

  async getFunctionImpact(workspaceId: string, functionName: string) {
    const graph = await this.buildCallGraph(workspaceId);
    const reverseGraph = new Map<string, string[]>();

    for (const edge of graph.edges) {
      if (!reverseGraph.has(edge.to)) {
        reverseGraph.set(edge.to, []);
      }
      reverseGraph.get(edge.to)!.push(edge.from);
    }

    const visited = new Set<string>();
    const affected = new Set<string>();

    const dfs = (node: string) => {
        const callers = reverseGraph.get(node);
        if (!callers) return;
        for(const caller of callers){
            if(visited.has(caller))continue;

            visited.add(caller);
            affected.add(caller);
            dfs(caller);
        }
    }
    return {
        function: functionName,
        impactScore: affected.size,
        affectedFunctions: Array.from(affected)
    };
  }
}
