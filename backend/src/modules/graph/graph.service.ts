import { ChunkRepository } from "../chunk/chunk.repository.js";
import { Chunk, ChunkType } from "../chunk/chunk.types.js";
import { GraphRepository } from "./graph.repository.js";
import {
  GraphNode,
  GraphEdge,
  GraphNodeType,
  GraphRelationType,
} from "./graph.types.js";

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

    return {
      nodes: nodes.map((node) => ({
        id: node.nodeId,
        type: node.type,
        label: node.name,
        filePath: node.filePath,
      })),

      edges: deduplicatedEdges.map((edge) => ({
        id: `${edge.source}-${edge.target}-${edge.relation}`,
        source: edge.source,
        target: edge.target,
        relation: edge.relation,
      })),
    };
  }

  async getExecutionFlowGraph(workspaceId: string) {
    const [nodes, callEdges] = await Promise.all([
      this.graphRepository.findNodesByWorkspace(workspaceId),
      this.graphRepository.getCallEdges(workspaceId),
    ]);
    console.log(nodes, callEdges);
    return {
      nodes: nodes.map((node) => ({
        id: node.nodeId,
        label: node.name,
        type: node.type,
        filePath: node.filePath,
      })),

      edges: callEdges.map((edge) => ({
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        relation: edge.relation,
      })),
    };
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
          const key = `{sourceId}:${targetId}:CALLS`;
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
      length: edges.length
    };
  }
}
