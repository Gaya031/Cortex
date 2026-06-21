import dagre from "dagre";
import { Node, Edge } from "reactflow";

const dagreGraph = new dagre.graphlib.Graph();

dagreGraph.setDefaultEdgeLabel(() => ({}));

const NODE_WIDTH = 220;
const NODE_HEIGHT = 60;

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[]
) {
  dagreGraph.setGraph({
    rankdir: "LR",
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(
      edge.source,
      edge.target
    );
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => {
      const position =
        dagreGraph.node(node.id);

      return {
        ...node,
        position: {
          x:
            position.x -
            NODE_WIDTH / 2,
          y:
            position.y -
            NODE_HEIGHT / 2,
        },
      };
    }),
    edges,
  };
}