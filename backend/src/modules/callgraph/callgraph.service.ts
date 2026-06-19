import { ChunkRepository } from "../chunk/chunk.repository.js";

export class CallgraphService {
  private readonly chunkRepository = new ChunkRepository();

  private buildReverseGraph(edges: { from: string; to: string }[]) {
    const reverseGraph = new Map<string, string[]>();
    for (const edge of edges) {
      if (!reverseGraph.has(edge.to)) {
        reverseGraph.set(edge.to, []);
      }
      reverseGraph.get(edge.to)!.push(edge.from);
    }
    return reverseGraph;
  }

  async buildCallGraph(workspaceId: string) {
    const chunks = await this.chunkRepository.findByWorkspace(workspaceId);

    const nodes = chunks.map((chunk) => ({
      id: `${chunk.filePath}:${chunk.name}`,
      name: chunk.name,
      filePath: chunk.filePath,
      type: chunk.type,
    }));

    const functionMap = new Map<string, string[]>();

    const COMMON_BUILT_INS = new Set([
      "useState",
      "useEffect",
      "useContext",
      "useReducer",
      "useCallback",
      "useMemo",
      "useRef",
      "useLayoutEffect",
      "setTimeout",
      "setInterval",
      "clearTimeout",
      "clearInterval",
      "parseInt",
      "parseFloat",
      "isNaN",
      "isFinite",
      "decodeURI",
      "decodeURIComponent",
      "encodeURI",
      "encodeURIComponent",
      "String",
      "Number",
      "Boolean",
      "Array",
      "Object",
      "Function",
      "Symbol",
      "BigInt",
      "Math",
      "Date",
      "RegExp",
      "Error",
      "Promise",
      "Map",
      "Set",
      "WeakMap",
      "WeakSet",
      "JSON",
      "Console",
      "require",
      "import",
      "console",
      "map",
      "filter",
      "reduce",
      "forEach",
      "find",
      "some",
      "every",
      "push",
      "pop",
      "shift",
      "unshift",
      "slice",
      "splice",
      "concat",
      "join",
      "split",
      "replace",
      "match",
      "test",
      "exec",
      "log",
      "error",
      "warn",
      "info",
      "debug",
      "dir",
      "table",
      "clear",
      "time",
      "timeEnd",
      "then",
      "catch",
      "finally",
      "resolve",
      "reject",
      "all",
      "race",
      "toString",
      "hasOwnProperty",
      "valueOf",
      "isPrototypeOf",
      "propertyIsEnumerable",
      "bind",
      "call",
      "apply",
    ]);

    for (const chunk of chunks) {
      if (COMMON_BUILT_INS.has(chunk.name)) continue;

      const nodeId = `${chunk.filePath}:${chunk.name}`;

      if (!functionMap.has(chunk.name)) {
        functionMap.set(chunk.name, []);
      }
      functionMap.get(chunk.name)!.push(nodeId);
    }
    const edges = [];
    for (const chunk of chunks) {
      for (const calledFunction of chunk.calls ?? []) {
        const targets = functionMap.get(calledFunction);
        if (!targets) continue;
        for (const target of targets) {
          edges.push({
            from: `${chunk.filePath}:${chunk.name}`,
            to: target,
          });
        }
      }
    }
    return { nodes, edges };
  }

  async getFunctionImpact(workspaceId: string, functionId: string) {
    const graph = await this.buildCallGraph(workspaceId);
    const reverseGraph = this.buildReverseGraph(graph.edges);
    const visited = new Set<string>();
    const affected = new Set<string>();

    const dfs = (node: string) => {
      const callers = reverseGraph.get(node);
      if (!callers) return;
      for (const caller of callers) {
        if (visited.has(caller)) continue;

        visited.add(caller);
        affected.add(caller);
        dfs(caller);
      }
    };
    console.log("Function id: ", functionId);
    console.log("Edges: ", graph.edges);
    dfs(functionId);

    return {
      function: functionId,
      impactScore: affected.size,
      affectedFunctions: Array.from(affected),
    };
  }

  async getEntryPoints(workspaceId: string, functionId: string) {
    const graph = await this.buildCallGraph(workspaceId);
    const reverseGraph = this.buildReverseGraph(graph.edges);

    const entryPoints = new Set<string>();
    const dfs = (node: string, visited = new Set<string>()) => {
      visited.add(node);
      const callers = reverseGraph.get(node);
      if (!callers || callers.length === 0) {
        entryPoints.add(node);
        return;
      }
      for (const caller of callers) {
        dfs(caller);
      }
    };
    dfs(functionId);
    return Array.from(entryPoints);
  }
}
