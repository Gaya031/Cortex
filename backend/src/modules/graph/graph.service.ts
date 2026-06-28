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
import {
  buildChunkNodeId,
  getChunkQualifiedName,
} from "../../shared/utils/chunk-node.util.js";
import { normalizeFilePath, toFileNodeId } from "../../shared/utils/path.util.js";

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

function chunkMatchesCall(chunk: Chunk, calledFunction: string): boolean {
  const qualified = getChunkQualifiedName(chunk);
  return (
    chunk.name === calledFunction ||
    qualified === calledFunction ||
    qualified.endsWith(`.${calledFunction}`)
  );
}

function inferRuntimeLayer(node: {
  nodeId: string;
  name: string;
  filePath?: string;
  type: string;
}): string {
  const text = `${node.nodeId} ${node.name} ${node.filePath ?? ""}`.toLowerCase();

  if (text.includes("redis") || text.includes("cache")) return "CACHE";
  if (
    text.includes("repository") ||
    text.includes("schema") ||
    text.includes("model") ||
    text.includes("database") ||
    text.includes("mongodb") ||
    text.includes("mongoose")
  ) {
    return "DATABASE";
  }
  if (text.includes("controller")) return "CONTROLLER";
  if (text.includes("service")) return "SERVICE";
  if (text.includes("route") || text.includes("router")) return "ROUTE";
  if (
    text.includes("/page") ||
    text.includes("/pages/") ||
    text.endsWith("page.tsx") ||
    text.endsWith("page.jsx")
  ) {
    return "PAGE";
  }
  if (node.type === GraphNodeType.COMPONENT) return "COMPONENT";
  if (node.type === GraphNodeType.METHOD) return "SERVICE";
  if (node.type === GraphNodeType.CLASS) return "SERVICE";
  if (node.type === GraphNodeType.FILE) return "FILE";
  return node.type;
}

const ENTRY_FILE_PATTERNS = [
  "src/app.tsx",
  "src/app.ts",
  "src/main.tsx",
  "src/main.ts",
  "src/index.tsx",
  "src/index.ts",
  "app/page.tsx",
  "pages/_app.tsx",
  "pages/index.tsx",
];

function isEntryFile(filePath: string): boolean {
  const normalized = normalizeFilePath(filePath);
  return ENTRY_FILE_PATTERNS.some(
    (pattern) => normalized === pattern || normalized.endsWith(`/${pattern}`),
  );
}

export class GraphService {
  private readonly graphRepository = new GraphRepository();
  private readonly chunkRepository = new ChunkRepository();

  buildGraph(workspaceId: string, filePath: string, chunks: Chunk[]) {
    const normalizedPath = normalizeFilePath(filePath);
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
      if (uniqueEdges.has(key)) return;
      uniqueEdges.add(key);
      edges.push({ workspaceId, source, target, relation });
    };

    const fileNodeId = toFileNodeId(normalizedPath);

    nodes.push({
      workspaceId,
      nodeId: fileNodeId,
      type: GraphNodeType.FILE,
      name: normalizedPath,
      filePath: normalizedPath,
    });
    createdNodeIds.add(fileNodeId);

    for (const chunk of chunks) {
      const chunkNodeId = buildChunkNodeId(chunk);
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
        case ChunkType.INTERFACE:
        case ChunkType.TYPE:
        case ChunkType.MODULE:
          nodeType = GraphNodeType.FUNCTION;
          break;
        default:
          nodeType = GraphNodeType.FUNCTION;
      }

      if (!createdNodeIds.has(chunkNodeId)) {
        nodes.push({
          workspaceId,
          nodeId: chunkNodeId,
          type: nodeType,
          name: getChunkQualifiedName(chunk),
          filePath: chunk.filePath,
        });
        createdNodeIds.add(chunkNodeId);
      }
    }

    const fileResolvedImports = [
      ...new Set(chunks.flatMap((chunk) => chunk.resolvedImports ?? [])),
    ];

    for (const chunk of chunks) {
      const chunkNodeId = buildChunkNodeId(chunk);
      addEdge(fileNodeId, chunkNodeId, GraphRelationType.CONTAINS);
    }

    for (const resolvedImport of fileResolvedImports) {
      const targetFileNodeId = toFileNodeId(resolvedImport);

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

    const allImports = [
      ...new Set(chunks.flatMap((chunk) => chunk.imports ?? [])),
    ];

    for (const importPath of allImports) {
      if (importPath.startsWith(".")) continue;

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

    for (const chunk of chunks) {
      const sourceId = buildChunkNodeId(chunk);

      for (const calledFunction of chunk.calls ?? []) {
        const targets = chunks.filter(
          (candidate) =>
            candidate.filePath === chunk.filePath &&
            chunkMatchesCall(candidate, calledFunction) &&
            buildChunkNodeId(candidate) !== sourceId,
        );

        for (const targetChunk of targets) {
          addEdge(sourceId, buildChunkNodeId(targetChunk), GraphRelationType.CALLS);
        }
      }
    }

    return { nodes, edges };
  }

  async getVisualizationGraph(workspaceId: string, mode: "full" | "files" = "files") {
    const key = cacheKeys.graph(workspaceId, mode === "files" ? "dependency-files" : "dependency");
    const cached = await cache.getJson<VisualGraph>(key);
    if (cached) return cached;

    const [nodes, edges] = await Promise.all([
      this.graphRepository.findNodesByWorkspace(workspaceId),
      this.graphRepository.findEdgesByWorkspace(workspaceId),
    ]);

    if (mode === "files") {
      const result = this.buildFileLevelGraph(nodes, edges);
      await cache.setJson(key, result, 60 * 15);
      return result;
    }

    const dependencyRelations = new Set<string>([
      GraphRelationType.CONTAINS,
      GraphRelationType.IMPORTS,
      GraphRelationType.FILE_IMPORTS_FILE,
    ]);

    const dependencyNodeTypes = new Set<string>([
      GraphNodeType.FILE,
      GraphNodeType.FUNCTION,
      GraphNodeType.COMPONENT,
      GraphNodeType.CLASS,
      GraphNodeType.METHOD,
      GraphNodeType.EXTERNAL_MODULE,
    ]);

    const uniqueEdges = new Set<string>();
    const dependencyEdges = edges.filter((edge) => {
      if (!dependencyRelations.has(edge.relation)) return false;
      const edgeKey = `${edge.source}-${edge.target}-${edge.relation}`;
      if (uniqueEdges.has(edgeKey)) return false;
      uniqueEdges.add(edgeKey);
      return true;
    });

    const result: VisualGraph = {
      nodes: nodes
        .filter((node) => dependencyNodeTypes.has(node.type))
        .map((node) => ({
          id: node.nodeId,
          type: node.type,
          label: node.name,
          filePath: node.filePath ?? "",
          graphLayer: "DEPENDENCY",
        })),
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

  private buildFileLevelGraph(
    nodes: Array<{ nodeId: string; type: string; name: string; filePath?: string | null }>,
    edges: Array<{ source: string; target: string; relation: string }>,
  ): VisualGraph {
    const fileNodeIds = new Set(
      nodes
        .filter((node) => node.type === GraphNodeType.FILE)
        .map((node) => node.nodeId),
    );

    const externalNodeIds = new Set(
      nodes
        .filter((node) => node.type === GraphNodeType.EXTERNAL_MODULE)
        .map((node) => node.nodeId),
    );

    const allowedIds = new Set([...fileNodeIds, ...externalNodeIds]);
    const uniqueEdges = new Set<string>();

    const dependencyEdges = edges.filter((edge) => {
      if (
        edge.relation !== GraphRelationType.FILE_IMPORTS_FILE &&
        edge.relation !== GraphRelationType.IMPORTS
      ) {
        return false;
      }
      if (!allowedIds.has(edge.source) || !allowedIds.has(edge.target)) {
        return false;
      }
      const edgeKey = `${edge.source}-${edge.target}-${edge.relation}`;
      if (uniqueEdges.has(edgeKey)) return false;
      uniqueEdges.add(edgeKey);
      return true;
    });

    return {
      nodes: nodes
        .filter(
          (node) =>
            node.type === GraphNodeType.FILE ||
            node.type === GraphNodeType.EXTERNAL_MODULE,
        )
        .map((node) => ({
          id: node.nodeId,
          type: node.type,
          label: node.type === GraphNodeType.FILE
            ? (node.filePath ?? node.name).split("/").pop() ?? node.name
            : node.name,
          filePath: node.filePath ?? "",
          graphLayer: "DEPENDENCY",
        })),
      edges: dependencyEdges.map((edge) => ({
        id: `${edge.source}-${edge.target}-${edge.relation}`,
        source: edge.source,
        target: edge.target,
        relation: edge.relation,
        graphLayer: "DEPENDENCY",
      })),
    };
  }

  async getExecutionFlowGraph(workspaceId: string) {
    const key = cacheKeys.graph(workspaceId, "projectflow");
    const cached = await cache.getJson<VisualGraph>(key);
    if (cached) return cached;

    const [allNodes, callEdges, importEdges, containsEdges] = await Promise.all([
      this.graphRepository.findNodesByWorkspace(workspaceId),
      this.graphRepository.getCallEdges(workspaceId),
      this.graphRepository.getFileImportEdges(workspaceId),
      this.graphRepository.getContainsEdges(workspaceId),
    ]);

    const includedTypes = new Set([
      GraphNodeType.FILE,
      GraphNodeType.FUNCTION,
      GraphNodeType.COMPONENT,
      GraphNodeType.CLASS,
      GraphNodeType.METHOD,
    ]);

    const runtimeNodes = allNodes
      .filter((node) => includedTypes.has(node.type as GraphNodeType))
      .map((node) => ({
        id: node.nodeId,
        label: node.name,
        type: inferRuntimeLayer({
          nodeId: node.nodeId,
          name: node.name,
          filePath: node.filePath ?? undefined,
          type: node.type,
        }),
        filePath: node.filePath ?? "",
        graphLayer: "EXECUTION",
      }));

    const nodeLayerMap = new Map(
      runtimeNodes.map((node) => [node.id, node.type]),
    );

    const flowEdges: VisualGraphEdge[] = [];
    const addedEdges = new Set<string>();

    const addFlowEdge = (
      source: string,
      target: string,
      relation: string = GraphRelationType.FLOW,
    ) => {
      if (!source || !target || source === target) return;
      const key = `${source}->${target}:${relation}`;
      if (addedEdges.has(key)) return;
      addedEdges.add(key);
      flowEdges.push({
        id: `${source}-${target}-${relation}`,
        source,
        target,
        relation,
        graphLayer: "EXECUTION",
      });
    };

    for (const edge of callEdges) {
      addFlowEdge(edge.source, edge.target, GraphRelationType.CALLS);
    }

    for (const edge of importEdges) {
      const sourceLayer = nodeLayerMap.get(edge.source);
      const targetLayer = nodeLayerMap.get(edge.target);
      if (!sourceLayer || !targetLayer) continue;
      if (sourceLayer !== targetLayer) {
        addFlowEdge(edge.source, edge.target, "IMPORT_FLOW");
      }
    }

    for (const edge of containsEdges) {
      if (!edge.source.startsWith("file:")) continue;
      addFlowEdge(edge.source, edge.target, GraphRelationType.CONTAINS);
    }

    const incomingCalls = new Map<string, number>();
    for (const edge of callEdges) {
      incomingCalls.set(edge.target, (incomingCalls.get(edge.target) ?? 0) + 1);
    }

    const browserNode: VisualGraphNode = {
      id: "browser",
      label: "Browser / Client",
      type: "ENTRY",
      filePath: "",
      graphLayer: "EXECUTION",
    };

    const responseNode: VisualGraphNode = {
      id: "response",
      label: "Response",
      type: "EXIT",
      filePath: "",
      graphLayer: "EXECUTION",
    };

    for (const node of runtimeNodes) {
      const isFrontendEntry =
        node.type === "PAGE" ||
        node.type === "COMPONENT" ||
        isEntryFile(node.filePath) ||
        (incomingCalls.get(node.id) ?? 0) === 0;

      if (isFrontendEntry && ["PAGE", "COMPONENT", "ROUTE", "FILE"].includes(node.type)) {
        addFlowEdge("browser", node.id, GraphRelationType.FLOW);
      }
    }

    for (const node of runtimeNodes) {
      if (["DATABASE", "CACHE"].includes(node.type)) {
        addFlowEdge(node.id, "response", GraphRelationType.FLOW);
        continue;
      }

      const hasOutgoingCall = callEdges.some((edge) => edge.source === node.id);
      if (
        !hasOutgoingCall &&
        ["SERVICE", "CONTROLLER", "REPOSITORY", "ROUTE"].includes(node.type)
      ) {
        addFlowEdge(node.id, "response", GraphRelationType.FLOW);
      }
    }

    addFlowEdge("response", "browser", GraphRelationType.FLOW);

    const result: VisualGraph = {
      nodes: [browserNode, ...runtimeNodes, responseNode],
      edges: flowEdges,
    };

    await cache.setJson(key, result, 60 * 15);
    return result;
  }

  private resolveCallTargets(
    caller: Chunk,
    calledFunction: string,
    chunksByFile: Map<string, Chunk[]>,
    exportMap: Map<string, Set<string>>,
  ): string[] {
    const targets: string[] = [];
    const sourceId = buildChunkNodeId(caller);

    const sameFileChunks = chunksByFile.get(caller.filePath) ?? [];
    for (const candidate of sameFileChunks) {
      if (
        chunkMatchesCall(candidate, calledFunction) &&
        buildChunkNodeId(candidate) !== sourceId
      ) {
        targets.push(buildChunkNodeId(candidate));
      }
    }
    if (targets.length > 0) {
      return [...new Set(targets)];
    }

    for (const binding of caller.importBindings ?? []) {
      if (binding.localName !== calledFunction) continue;

      const targetFile = binding.resolvedFilePath
        ? normalizeFilePath(binding.resolvedFilePath)
        : null;
      if (!targetFile) continue;

      const fileChunks = chunksByFile.get(targetFile) ?? [];
      for (const candidate of fileChunks) {
        if (binding.importedName === "default") {
          if (
            (candidate.exports ?? []).includes("default") ||
            (candidate.exports ?? []).includes(candidate.name)
          ) {
            targets.push(buildChunkNodeId(candidate));
          }
        } else if (binding.importedName === "*") {
          if (chunkMatchesCall(candidate, calledFunction)) {
            targets.push(buildChunkNodeId(candidate));
          }
        } else if (
          candidate.name === binding.importedName ||
          chunkMatchesCall(candidate, binding.importedName)
        ) {
          targets.push(buildChunkNodeId(candidate));
        }
      }
    }
    if (targets.length > 0) {
      return [...new Set(targets)];
    }

    for (const importedFile of caller.resolvedImports ?? []) {
      const normalizedImport = normalizeFilePath(importedFile);
      const fileChunks = chunksByFile.get(normalizedImport) ?? [];
      const exportedNames = exportMap.get(normalizedImport) ?? new Set<string>();

      for (const candidate of fileChunks) {
        if (
          (exportedNames.has(candidate.name) ||
            exportedNames.has(getChunkQualifiedName(candidate))) &&
          chunkMatchesCall(candidate, calledFunction)
        ) {
          targets.push(buildChunkNodeId(candidate));
        }
      }
    }

    return [...new Set(targets)];
  }

  async buildCallEdges(workspaceId: string) {
    const chunks = await this.chunkRepository.findByWorkspace(workspaceId);
    const edges: GraphEdge[] = [];
    const uniqueEdges = new Set<string>();

    const chunksByFile = new Map<string, Chunk[]>();
    const exportMap = new Map<string, Set<string>>();

    for (const chunk of chunks) {
      if (!chunksByFile.has(chunk.filePath)) {
        chunksByFile.set(chunk.filePath, []);
      }
      chunksByFile.get(chunk.filePath)!.push(chunk);

      const normalizedPath = normalizeFilePath(chunk.filePath);
      if (!exportMap.has(normalizedPath)) {
        exportMap.set(normalizedPath, new Set(chunk.exports ?? []));
      } else {
        for (const name of chunk.exports ?? []) {
          exportMap.get(normalizedPath)!.add(name);
        }
      }
    }

    const calledByMap = new Map<string, Set<string>>();

    for (const chunk of chunks) {
      const sourceId = buildChunkNodeId(chunk);

      for (const calledFunction of chunk.calls ?? []) {
        const targets = this.resolveCallTargets(
          chunk,
          calledFunction,
          chunksByFile,
          exportMap,
        );

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

          if (!calledByMap.has(targetId)) {
            calledByMap.set(targetId, new Set());
          }
          calledByMap.get(targetId)!.add(sourceId);
        }
      }
    }

    if (edges.length > 0) {
      await this.graphRepository.createEdges(edges);
    }

    await this.populateChunkRelationships(chunks, calledByMap);

    return { edges, length: edges.length };
  }

  private async populateChunkRelationships(
    chunks: Chunk[],
    calledByMap: Map<string, Set<string>>,
  ) {
    const workspaceId = chunks[0]?.workspaceId;
    if (!workspaceId) return;

    await this.chunkRepository.bulkUpdateRelationships(
      workspaceId,
      chunks.map((chunk) => ({
        filePath: chunk.filePath,
        name: chunk.name,
        type: chunk.type,
        parentChunk: chunk.parentChunk,
        dependencies: (chunk.resolvedImports ?? []).map(normalizeFilePath),
        calledBy: [...(calledByMap.get(buildChunkNodeId(chunk)) ?? [])],
      })),
    );
  }
}
