import { ChunkRepository } from "../chunk/chunk.repository.js";
import { Chunk, ChunkType } from "../chunk/chunk.types.js";
import { GraphRepository } from "./graph.repository.js";
import {
  GraphNode,
  GraphEdge,
  GraphNodeType,
  GraphRelationType,
} from "./graph.types.js";
import { cache, cacheKeys } from "../../shared/redis/redis.js";

interface VisualGraphNode {
  id: string;
  type: string;
  label: string;
  filePath: string;
  graphLayer: string;
}

interface VisualGraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  graphLayer: string;
}

interface VisualGraph {
  nodes: VisualGraphNode[];
  edges: VisualGraphEdge[];
}

export class GraphService {
  private readonly graphRepository = new GraphRepository();
  private readonly chunkRepository = new ChunkRepository();

  buildGraph(workspaceId: string, filePath: string, chunks: Chunk[]) {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    const createdNodeIds = new Set<string>();
    const uniqueEdges = new Set<string>();

    const addEdge = (
      source: string,
      target: string,
      relation: GraphRelationType,
    ) => {
      const key = `${source}:${target}:${relation}`;

      if (uniqueEdges.has(key)) {
        return;
      }

      uniqueEdges.add(key);

      edges.push({
        workspaceId,
        source,
        target,
        relation,
      });
    };

    const fileNodeId = `file:${filePath}`;

    nodes.push({
      workspaceId,
      nodeId: fileNodeId,
      type: GraphNodeType.FILE,
      name: filePath,
      filePath,
    });

    createdNodeIds.add(fileNodeId);

    /*
      ------------------------------------------------
      PASS 1
      Create all nodes first
      ------------------------------------------------
    */

    for (const chunk of chunks) {
      const chunkNodeId = `${chunk.filePath}:${chunk.type}:${chunk.name}`;

      let nodeType: GraphNodeType;

      switch (chunk.type) {
        case ChunkType.COMPONENT:
          nodeType = GraphNodeType.COMPONENT;
          break;

        case ChunkType.CLASS:
          nodeType = GraphNodeType.CLASS;
          break;

        case ChunkType.METHOD:
          nodeType = GraphNodeType.METHOD;
          break;

        default:
          nodeType = GraphNodeType.FUNCTION;
      }

      if (!createdNodeIds.has(chunkNodeId)) {
        nodes.push({
          workspaceId,
          nodeId: chunkNodeId,
          type: nodeType,
          name: chunk.name,
          filePath: chunk.filePath,
        });

        createdNodeIds.add(chunkNodeId);
      }
    }

    /*
      ------------------------------------------------
      PASS 2
      Create CONTAINS + IMPORT edges
      ------------------------------------------------
    */

    for (const chunk of chunks) {
      const chunkNodeId = `${chunk.filePath}:${chunk.type}:${chunk.name}`;

      addEdge(fileNodeId, chunkNodeId, GraphRelationType.CONTAINS);

      /*
        FILE -> FILE imports
      */
      for (const resolvedImport of chunk.resolvedImports ?? []) {
        const targetFileNodeId = `file:${resolvedImport}`;

        if (!createdNodeIds.has(targetFileNodeId)) {
          nodes.push({
            workspaceId,
            nodeId: targetFileNodeId,
            type: GraphNodeType.FILE,
            name: resolvedImport,
            filePath: resolvedImport,
          });

          createdNodeIds.add(targetFileNodeId);
        }

        addEdge(
          fileNodeId,
          targetFileNodeId,
          GraphRelationType.FILE_IMPORTS_FILE,
        );
      }

      /*
        FILE -> External Module imports
      */
      for (const importPath of chunk.imports ?? []) {
        if (importPath.startsWith(".")) {
          continue;
        }

        const externalNodeId = `external:${importPath}`;

        if (!createdNodeIds.has(externalNodeId)) {
          nodes.push({
            workspaceId,
            nodeId: externalNodeId,
            type: GraphNodeType.EXTERNAL_MODULE,
            name: importPath,
            filePath: importPath,
          });

          createdNodeIds.add(externalNodeId);
        }

        addEdge(fileNodeId, externalNodeId, GraphRelationType.IMPORTS);
      }
    }

    /*
      ------------------------------------------------
      PASS 3
      Build Function Lookup
      ------------------------------------------------
    */

    const functionLookup = new Map<string, string[]>();

    for (const chunk of chunks) {
      const nodeId = `${chunk.filePath}:${chunk.type}:${chunk.name}`;

      if (!functionLookup.has(chunk.name)) {
        functionLookup.set(chunk.name, []);
      }

      functionLookup.get(chunk.name)!.push(nodeId);
    }

    /*
      ------------------------------------------------
      PASS 4
      Create CALLS edges
      ------------------------------------------------
    */

    for (const chunk of chunks) {
      const sourceId = `${chunk.filePath}:${chunk.type}:${chunk.name}`;

      for (const calledFunction of chunk.calls ?? []) {
        const targets = chunks.filter(
          (c) => c.name === calledFunction && c.filePath !== chunk.filePath,
        );
        for (const targetChunk of targets) {
          const targetNodeId = `${targetChunk.filePath}:${targetChunk.type}:${targetChunk.name}`;
          addEdge(sourceId, targetNodeId, GraphRelationType.CALLS);
        }

        // if (!targets) {
        //   continue;
        // }

        // for (const targetId of targets) {
        //   if (sourceId === targetId) {
        //     continue;
        //   }

        //   addEdge(sourceId, targetId, GraphRelationType.CALLS);
      }
    }

    return {
      nodes,
      edges,
    };
  }

  async getVisualizationGraph(workspaceId: string) {
    const key = cacheKeys.graph(workspaceId, "dependency");
    const cached = await cache.getJson<VisualGraph>(key);

    if (cached) {
      return cached;
    }

    const [nodes, edges] = await Promise.all([
      this.graphRepository.findNodesByWorkspace(workspaceId),
      this.graphRepository.findEdgesByWorkspace(workspaceId),
    ]);

    const uniqueEdges = new Set<string>();

    const deduplicatedEdges = edges.filter((edge) => {
      const key = `${edge.source}-${edge.target}-${edge.relation}`;

      if (uniqueEdges.has(key)) {
        return false;
      }

      uniqueEdges.add(key);

      return true;
    });

    const dependencyRelations = new Set<string>([
      GraphRelationType.CONTAINS,
      GraphRelationType.IMPORTS,
      GraphRelationType.FILE_IMPORTS_FILE,
    ]);

    const dependencyEdges = deduplicatedEdges.filter((edge) =>
      dependencyRelations.has(edge.relation),
    );

    const dependencyNodeIds = new Set<string>();
    dependencyEdges.forEach((edge) => {
      dependencyNodeIds.add(edge.source);
      dependencyNodeIds.add(edge.target);
    });

    const result: VisualGraph = {
      nodes: nodes.map((node) => ({
        id: node.nodeId,
        type: node.type,
        label: node.name,
        filePath: node.filePath ?? "",
        graphLayer: "DEPENDENCY",
      })).filter((node) => dependencyNodeIds.has(node.id)),

      edges: dependencyEdges.map((edge) => ({
        id: `${edge.source}-${edge.target}-${edge.relation}`,
        source: edge.source,
        target: edge.target,
        relation: edge.relation,
        graphLayer: "DEPENDENCY",
      })),
    };

    await cache.setJson(key, result, 60 * 15);

    return result;
  }

  async getExecutionFlowGraph(workspaceId: string) {
    const key = cacheKeys.graph(workspaceId, "projectflow");
    const cached = await cache.getJson<VisualGraph>(key);

    if (cached) {
      return cached;
    }

    const [allNodes, allEdges] = await Promise.all([
      this.graphRepository.findNodesByWorkspace(workspaceId),
      this.graphRepository.findEdgesByWorkspace(workspaceId),
    ]);

    const normalizeRuntimeType = (node: any) => {
      const text = `${node.nodeId} ${node.name} ${node.filePath}`.toLowerCase();

      if (text.includes("route")) return "ROUTE";
      if (text.includes("controller")) return "CONTROLLER";
      if (text.includes("service")) return "SERVICE";
      if (text.includes("repository")) return "REPOSITORY";
      if (text.includes("model")) return "DATABASE";
      if (text.includes("database") || text.includes("mongodb")) return "DATABASE";
      if (text.includes("redis") || text.includes("cache")) return "CACHE";
      if (text.includes("page") || text.includes("screen")) return "PAGE";
      if (node.type === GraphNodeType.COMPONENT) return "COMPONENT";
      if (node.type === GraphNodeType.FILE) return "FILE";

      return node.type;
    };

    const runtimeNodes = allNodes
      .filter((node) =>
        [
          GraphNodeType.FILE,
          GraphNodeType.FUNCTION,
          GraphNodeType.COMPONENT,
          GraphNodeType.CLASS,
          GraphNodeType.METHOD,
        ].includes(node.type as GraphNodeType),
      )
      .map((node) => ({
        id: node.nodeId,
        label: node.name,
        type: normalizeRuntimeType(node),
        filePath: node.filePath ?? "",
        graphLayer: "EXECUTION",
      }));

    const browserNode: VisualGraphNode = {
      id: "browser",
      label: "Browser",
      type: "ENTRY",
      filePath: "",
      graphLayer: "EXECUTION",
    };

    const responseNode: VisualGraphNode = {
      id: "response",
      label: "Response",
      type: "ENTRY",
      filePath: "",
      graphLayer: "EXECUTION",
    };

    // Helper to find common semantic feature keywords (e.g. auth, user, order, etc.)
    const isFeatureMatch = (nodeA: any, nodeB: any) => {
      const nameA = `${nodeA.id} ${nodeA.label} ${nodeA.filePath}`.toLowerCase();
      const nameB = `${nodeB.id} ${nodeB.label} ${nodeB.filePath}`.toLowerCase();

      const keywords = [
        "user", "order", "login", "auth", "dashboard", 
        "workspace", "indexer", "api", "project", "chat", 
        "assistant", "insight", "file", "chunk", "parser"
      ];
      for (const keyword of keywords) {
        if (nameA.includes(keyword) && nameB.includes(keyword)) {
          return true;
        }
      }
      return false;
    };

    // Cache database call connections for lookup
    const callTargets = new Map<string, string[]>();
    allEdges.forEach((edge) => {
      if (edge.relation === GraphRelationType.CALLS) {
        if (!callTargets.has(edge.source)) {
          callTargets.set(edge.source, []);
        }
        callTargets.get(edge.source)!.push(edge.target);
      }
    });

    const flowEdges: VisualGraphEdge[] = [];
    const addedEdges = new Set<string>();

    const safeAddEdge = (source: string, target: string, relationName = "FLOW") => {
      const key = `${source}->${target}`;
      if (source === target || addedEdges.has(key)) return;
      addedEdges.add(key);
      flowEdges.push({
        id: `${source}-${target}-FLOW`,
        source,
        target,
        relation: relationName,
        graphLayer: "EXECUTION",
      });
    };

    // 1. Group nodes by runtime layers
    const pages = runtimeNodes.filter(
      (n) => n.type === "PAGE" || n.label.toLowerCase().includes("page"),
    );
    const components = runtimeNodes.filter(
      (n) => n.type === "COMPONENT" && !pages.includes(n),
    );
    const routes = runtimeNodes.filter(
      (n) => n.type === "ROUTE" || n.label.toLowerCase().includes("route"),
    );
    const controllers = runtimeNodes.filter(
      (n) => n.type === "CONTROLLER" || n.label.toLowerCase().includes("controller"),
    );
    const services = runtimeNodes.filter(
      (n) => n.type === "SERVICE" || n.label.toLowerCase().includes("service"),
    );
    const databases = runtimeNodes.filter(
      (n) =>
        n.type === "DATABASE" ||
        n.type === "REPOSITORY" ||
        n.label.toLowerCase().includes("database") ||
        n.label.toLowerCase().includes("repository") ||
        n.label.toLowerCase().includes("model"),
    );
    const caches = runtimeNodes.filter((n) => n.type === "CACHE");

    const otherNodes = runtimeNodes.filter(
      (n) =>
        !pages.includes(n) &&
        !components.includes(n) &&
        !routes.includes(n) &&
        !controllers.includes(n) &&
        !services.includes(n) &&
        !databases.includes(n) &&
        !caches.includes(n),
    );

    // 2. Connect Browser to Page nodes
    if (pages.length > 0) {
      pages.forEach((p) => safeAddEdge("browser", p.id));
    } else {
      // Fallback: connect browser to top components/other nodes
      components.slice(0, 4).forEach((c) => safeAddEdge("browser", c.id));
      otherNodes.slice(0, 4).forEach((o) => safeAddEdge("browser", o.id));
    }

    // 3. Connect Pages to Components (and other related functions)
    pages.forEach((p) => {
      let connected = false;
      const targets = callTargets.get(p.id) || [];
      targets.forEach((t) => {
        if (components.some((c) => c.id === t) || otherNodes.some((o) => o.id === t)) {
          safeAddEdge(p.id, t);
          connected = true;
        }
      });

      // Semantic/feature fallback connection
      if (!connected) {
        components.concat(otherNodes).forEach((c) => {
          if (isFeatureMatch(p, c)) {
            safeAddEdge(p.id, c.id);
            connected = true;
          }
        });
      }
    });

    // 4. Connect Components/Frontend Functions to Backend Routes
    components.concat(otherNodes).forEach((c) => {
      let connected = false;
      const targets = callTargets.get(c.id) || [];
      targets.forEach((t) => {
        if (routes.some((r) => r.id === t)) {
          safeAddEdge(c.id, t);
          connected = true;
        }
      });

      // Semantic/feature fallback connection
      if (!connected) {
        routes.forEach((r) => {
          if (isFeatureMatch(c, r)) {
            safeAddEdge(c.id, r.id);
            connected = true;
          }
        });
      }
    });

    // 5. Connect Routes to Controllers
    routes.forEach((r) => {
      let connected = false;
      const targets = callTargets.get(r.id) || [];
      targets.forEach((t) => {
        if (controllers.some((ctrl) => ctrl.id === t)) {
          safeAddEdge(r.id, t);
          connected = true;
        }
      });

      if (!connected) {
        controllers.forEach((ctrl) => {
          if (isFeatureMatch(r, ctrl)) {
            safeAddEdge(r.id, ctrl.id);
            connected = true;
          }
        });
      }
    });

    // 6. Connect Controllers to Services
    controllers.forEach((ctrl) => {
      let connected = false;
      const targets = callTargets.get(ctrl.id) || [];
      targets.forEach((t) => {
        if (services.some((s) => s.id === t)) {
          safeAddEdge(ctrl.id, t);
          connected = true;
        }
      });

      if (!connected) {
        services.forEach((s) => {
          if (isFeatureMatch(ctrl, s)) {
            safeAddEdge(ctrl.id, s.id);
            connected = true;
          }
        });
      }
    });

    // 7. Connect Services to Databases/Caches
    services.forEach((s) => {
      let connected = false;
      const targets = callTargets.get(s.id) || [];
      targets.forEach((t) => {
        if (databases.some((d) => d.id === t) || caches.some((ca) => ca.id === t)) {
          safeAddEdge(s.id, t);
          connected = true;
        }
      });

      if (!connected) {
        databases.concat(caches).forEach((d) => {
          if (isFeatureMatch(s, d)) {
            safeAddEdge(s.id, d.id);
            connected = true;
          }
        });
      }
    });

    // 8. Connect Databases/Caches to Response
    let responseConnected = false;
    databases.concat(caches).forEach((d) => {
      safeAddEdge(d.id, "response");
      responseConnected = true;
    });

    if (!responseConnected) {
      // Connect services directly to response if no databases exist
      services.forEach((s) => {
        safeAddEdge(s.id, "response");
        responseConnected = true;
      });
      
      if (!responseConnected) {
        // Fallback: connect routes directly to response
        routes.forEach((r) => {
          safeAddEdge(r.id, "response");
          responseConnected = true;
        });
      }
    }

    // 9. Response back to Browser (closed loop)
    if (responseConnected) {
      safeAddEdge("response", "browser");
    }

    // 10. Filter nodes to only include connected ones
    const usedNodeIds = new Set<string>(["browser"]);
    if (responseConnected) {
      usedNodeIds.add("response");
    }

    flowEdges.forEach((edge) => {
      usedNodeIds.add(edge.source);
      usedNodeIds.add(edge.target);
    });

    const connectedNodes = [
      browserNode,
      ...(responseConnected ? [responseNode] : []),
      ...runtimeNodes.filter(
        (n) =>
          usedNodeIds.has(n.id) &&
          n.id !== "browser" &&
          n.id !== "response",
      ),
    ];

    const result: VisualGraph = {
      nodes: connectedNodes,
      edges: flowEdges,
    };

    await cache.setJson(key, result, 60 * 15);

    return result;
  }

  async buildCallEdges(workspaceId: string) {
    const chunks = await this.chunkRepository.findByWorkspace(workspaceId);
    const edges: GraphEdge[] = [];
    const functionLookup = new Map<string, string[]>();
    for (const chunk of chunks) {
      const nodeId = `${chunk.filePath}:${chunk.type}:${chunk.name}`;
      if (!functionLookup.has(chunk.name)) {
        functionLookup.set(chunk.name, []);
      }
      functionLookup.get(chunk.name)!.push(nodeId);
    }
    const uniqueEdges = new Set<string>();
    for (const chunk of chunks) {
      const sourceId = `${chunk.filePath}:${chunk.type}:${chunk.name}`;
      for (const calledFunction of chunk.calls ?? []) {
        const targets = functionLookup.get(calledFunction);
        if (!targets) continue;
        for (const targetId of targets) {
          if (targetId === sourceId) continue;
          const key = `${sourceId}:${targetId}:CALLS`;
          if (uniqueEdges.has(key)) continue;
          uniqueEdges.add(key);
          edges.push({
            workspaceId,
            source: sourceId,
            target: targetId,
            relation: GraphRelationType.CALLS,
          });
        }
      }
    }
    if (edges.length > 0) {
      await this.graphRepository.createEdges(edges);
    }
    return {
      edges: edges,
      length: edges.length,
    };
  }
}
