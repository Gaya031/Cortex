import { Chunk, ChunkType } from "../chunk/chunk.types.js";
import { GraphRepository } from "./graph.repository.js";
import { ChunkRepository } from "../chunk/chunk.repository.js";
import {
  GraphNode,
  GraphEdge,
  GraphNodeType,
  GraphRelationType,
} from "./graph.types.js";

export class GraphService {
  private readonly graphRepository = new GraphRepository();

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
      if (!uniqueEdges.has(key)) {
        uniqueEdges.add(key);
        edges.push({ workspaceId, source, target, relation });
      } else {
        return;
      }
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

    const functionIndex = new Map<string, string[]>();

    for (const chunk of chunks) {
      const nodeId = `${chunk.filePath}:${chunk.type}:${chunk.name}`;
      if (!functionIndex.has(chunk.name)) {
        functionIndex.set(chunk.name, []);
      }
      functionIndex.get(chunk.name)!.push(nodeId);
    }
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
      addEdge(fileNodeId, chunkNodeId, GraphRelationType.CONTAINS);

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

      for (const importPath of chunk.imports ?? []) {
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

      for (const calledFunction of chunk.calls ?? []) {
        const targets = functionIndex.get(calledFunction);
        if (!targets?.length) continue;
        for (const targetNodeId of targets) {
          addEdge(chunkNodeId, targetNodeId, GraphRelationType.CALLS);
        }
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

    // const uniqueEdges = new Set<string>();
    // const deduplicatedEdges: any[] = [];

    // edges.forEach((edge) => {
    //   const key = `${edge.source}-${edge.target}-${edge.relation}`;
    //   if (!uniqueEdges.has(key)) {
    //     uniqueEdges.add(key);
    //     deduplicatedEdges.push({
    //       id: key,
    //       source: edge.source,
    //       target: edge.target,
    //       relation: edge.relation,
    //     });
    //   }
    // });

    return {
      nodes: nodes.map((node) => ({
        id: node.nodeId,
        type: node.type,
        label: node.name || node.nodeId.replace("file: ", ""),
        filePath: node.filePath,
      })),
      edges: edges.map((edge) => ({
        id: `${edge.source}-${edge.target}-${edge.relation}`,
        source: edge.source,
        target: edge.target,
        relation: edge.relation,
      })),
    };
  }

  // async getProjectFlowGraph(workspaceId: string) {
  //   const [allNodes, allEdges] = await Promise.all([
  //     this.graphRepository.findNodesByWorkspace(workspaceId),
  //     this.graphRepository.findEdgesByWorkspace(workspaceId),
  //   ]);

  //   const mappedNodes: any[] = [];
  //   const mappedEdges: any[] = [];
  //   const addedNodeIds = new Set<string>();

  //   const fileNodes = allNodes.filter((n) => n.type === GraphNodeType.FILE);
  //   const externalNodes = allNodes.filter(
  //     (n) => n.type === GraphNodeType.EXTERNAL_MODULE,
  //   );

  //   const relevantEdges = allEdges.filter(
  //     (e) => e.relation === GraphRelationType.IMPORTS,
  //   );

  //   const incomingEdgeCounts = new Map<string, number>();
  //   relevantEdges.forEach((e) => {
  //     // Only count if source is a FILE node (to avoid false entries)
  //     const isSourceFile = fileNodes.some((n) => n.nodeId === e.source);
  //     if (isSourceFile) {
  //       incomingEdgeCounts.set(
  //         e.target,
  //         (incomingEdgeCounts.get(e.target) || 0) + 1,
  //       );
  //     }
  //   });

  //   const folders = new Set<string>();

  //   fileNodes.forEach((node) => {
  //     const isEntry = !incomingEdgeCounts.get(node.nodeId);

  //     mappedNodes.push({
  //       id: node.nodeId,
  //       type: isEntry ? GraphNodeType.ENTRY_FILE : GraphNodeType.FILE,
  //       label: node.name || node.nodeId.replace("file:", ""),
  //       filePath: node.filePath,
  //       position: { x: 0, y: 0 },
  //     });
  //     addedNodeIds.add(node.nodeId);

  //     if (node.filePath) {
  //       const parts = node.filePath.split("/");
  //       if (parts.length > 1) {
  //         parts.pop();
  //         const folderPath = parts.join("/");
  //         folders.add(folderPath);

  //         mappedEdges.push({
  //           id: `folder-contains-${folderPath}-${node.nodeId}`,
  //           source: `folder:${folderPath}`,
  //           target: node.nodeId,
  //           relation: GraphRelationType.CONTAINS,
  //         });
  //       }
  //     }
  //   });

  //   const importedTargets = new Set(relevantEdges.map((e) => e.target));
  //   externalNodes.forEach((node) => {
  //     if (importedTargets.has(node.nodeId)) {
  //       mappedNodes.push({
  //         id: node.nodeId,
  //         type: GraphNodeType.EXTERNAL_MODULE,
  //         label: node.name,
  //         filePath: node.filePath,
  //         position: { x: 0, y: 0 },
  //       });
  //       addedNodeIds.add(node.nodeId);
  //     }
  //   });

  //   folders.forEach((folder) => {
  //     const folderId = `folder:${folder}`;
  //     mappedNodes.push({
  //       id: folderId,
  //       type: GraphNodeType.FOLDER,
  //       label: folder,
  //       filePath: folder,
  //       position: { x: 0, y: 0 },
  //     });
  //     addedNodeIds.add(folderId);
  //   });

  //   let edgeIdx = 0;
  //   const uniqueFlowEdges = new Set<string>();

  //   relevantEdges.forEach((edge) => {
  //     if (addedNodeIds.has(edge.source) && addedNodeIds.has(edge.target)) {
  //       const edgeKey = `${edge.source}-${edge.target}-${edge.relation}`;
  //       if (!uniqueFlowEdges.has(edgeKey)) {
  //         uniqueFlowEdges.add(edgeKey);
  //         mappedEdges.push({
  //           id: `flow-edge-${edgeIdx++}`,
  //           source: edge.source,
  //           target: edge.target,
  //           relation: edge.relation,
  //         });
  //       }
  //     }
  //   });

  //   return {
  //     nodes: mappedNodes,
  //     edges: mappedEdges,
  //   };
  // }
  
  async getProjectFlowGraph(workspaceId: string) {
    const [nodes, callEdges] = await Promise.all([
      this.graphRepository.findNodesByWorkspace(workspaceId),
      this.graphRepository.getCallEdges(workspaceId),
    ]);
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
}
