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

  buildGraph(workspaceId: string, filePath: string, chunks: Chunk[]) {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const createdNodeIds = new Set<string>();

    const fileNodeId = `file:${filePath}`;

    nodes.push({
      workspaceId,
      nodeId: fileNodeId,
      type: GraphNodeType.FILE,
      name: filePath,
      filePath,
    });

    createdNodeIds.add(fileNodeId);

    const processedImports = new Set<string>();

    chunks.forEach((chunk) => {
      const chunkNodeId = `${filePath}:${chunk.type}:${chunk.name}`;

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
          filePath,
        });

        createdNodeIds.add(chunkNodeId);
      }

      edges.push({
        workspaceId,
        source: fileNodeId,
        target: chunkNodeId,
        relation: GraphRelationType.CONTAINS,
      });

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
        edges.push({
          workspaceId,
          source: fileNodeId,
          target: targetFileNodeId,
          relation: GraphRelationType.IMPORTS,
        });
      }

      for (const importPath of chunk.imports) {
        const alreadyResolved = (chunk.resolvedImports ?? []).some(
          (resolvedPath) => importPath.includes(resolvedPath),
        );
        if (alreadyResolved) continue;
        if (importPath.startsWith(".")) continue;
        const importNodeId = `external:${importPath}`;
        if (!createdNodeIds.has(importNodeId)) {
          nodes.push({
            workspaceId,
            nodeId: importNodeId,
            type: GraphNodeType.EXTERNAL_MODULE,
            name: importPath,
            filePath: importPath,
          });
          createdNodeIds.add(importNodeId);
        }
        edges.push({
          workspaceId,
          source: fileNodeId,
          target: importNodeId,
          relation: GraphRelationType.IMPORTS,
        });
      }

      // for (const importPath of chunk.imports) {
      //   if (processedImports.has(importPath)) {
      //     continue;
      //   }

      //   processedImports.add(importPath);

      //   const importNodeId = `import:${importPath}`;

      //   if (!createdNodeIds.has(importNodeId)) {
      //     nodes.push({
      //       workspaceId,
      //       nodeId: importNodeId,
      //       type: GraphNodeType.EXTERNAL_MODULE,
      //       name: importPath,
      //       filePath: importPath,
      //     });

      //     createdNodeIds.add(importNodeId);
      //   }

      //   edges.push({
      //     workspaceId,
      //     source: fileNodeId,
      //     target: importNodeId,
      //     relation: GraphRelationType.IMPORTS,
      //   });
      // }
    });

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
    return {
      nodes: nodes.map((node, index) => ({
        id: node.nodeId,
        type: node.type,
        label: node.name || node.nodeId.replace("file: ", ""),
        position: {
          x: (index % 5) * 300,
          y: Math.floor(index / 5) * 150,
        },
      })),
      edges: edges.map((edge) => ({
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        relation: edge.relation,
      })),
    };
  }
}
