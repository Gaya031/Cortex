"use client";

import
  {
    Background,
    Controls,
    Edge,
    MarkerType,
    MiniMap,
    Node,
    ReactFlow,
  } from "reactflow";

import "reactflow/dist/style.css";

import dagre from "dagre";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

import { useArchitectureStore } from "../../store/useArchitectureStore";

const NODE_WIDTH = 230;
const NODE_HEIGHT = 72;

function getLayoutedElements (
  nodes: Node[],
  edges: Edge[],
  rankdir: "LR" | "TB" = "LR",
)
{
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir,
    nodesep: 48,
    ranksep: 96,
  });

  nodes.forEach((node) =>
  {
    dagreGraph.setNode(node.id, {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });
  });

  edges.forEach((edge) =>
  {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) =>
    {
      const position = dagreGraph.node(node.id);

      return {
        ...node,
        position: {
          x: position.x - NODE_WIDTH / 2,
          y: position.y - NODE_HEIGHT / 2,
        },
      };
    }),
    edges,
  };
}

function getNodeColors (type: string)
{
  switch (type)
  {
    case "ENTRY":
      return {
        bg: "rgba(244, 63, 94, 0.08)",
        border: "rgba(244, 63, 94, 0.3)",
        text: "#fda4af",
      };
    case "FILE":
      return {
        bg: "rgba(14, 165, 233, 0.08)",
        border: "rgba(14, 165, 233, 0.3)",
        text: "#7dd3fc",
      };
    case "FUNCTION":
      return {
        bg: "rgba(16, 185, 129, 0.08)",
        border: "rgba(16, 185, 129, 0.3)",
        text: "#6ee7b7",
      };
    case "COMPONENT":
      return {
        bg: "rgba(168, 85, 247, 0.08)",
        border: "rgba(168, 85, 247, 0.3)",
        text: "#c084fc",
      };
    case "CLASS":
      return {
        bg: "rgba(249, 115, 22, 0.08)",
        border: "rgba(249, 115, 22, 0.3)",
        text: "#ffedd5",
      };
    case "ROUTE":
      return {
        bg: "rgba(59, 130, 246, 0.08)",
        border: "rgba(59, 130, 246, 0.3)",
        text: "#93c5fd",
      };
    case "CONTROLLER":
      return {
        bg: "rgba(139, 92, 246, 0.08)",
        border: "rgba(139, 92, 246, 0.3)",
        text: "#c4b5fd",
      };
    case "SERVICE":
      return {
        bg: "rgba(20, 184, 166, 0.08)",
        border: "rgba(20, 184, 166, 0.3)",
        text: "#99f6e4",
      };
    case "REPOSITORY":
      return {
        bg: "rgba(234, 179, 8, 0.08)",
        border: "rgba(234, 179, 8, 0.3)",
        text: "#fef08a",
      };
    case "DATABASE":
      return {
        bg: "rgba(239, 68, 68, 0.08)",
        border: "rgba(239, 68, 68, 0.3)",
        text: "#fca5a5",
      };
    case "CACHE":
      return {
        bg: "rgba(34, 197, 94, 0.08)",
        border: "rgba(34, 197, 94, 0.3)",
        text: "#86efac",
      };
    case "PAGE":
      return {
        bg: "rgba(79, 70, 229, 0.08)",
        border: "rgba(79, 70, 229, 0.3)",
        text: "#c7d2fe",
      };
    case "EXTERNAL_MODULE":
      return {
        bg: "rgba(107, 114, 128, 0.08)",
        border: "rgba(107, 114, 128, 0.3)",
        text: "#cbd5e1",
      };
    default:
      return {
        bg: "rgba(30, 41, 59, 0.08)",
        border: "rgba(71, 85, 105, 0.3)",
        text: "#e2e8f0",
      };
  }
}

export default function GraphCanvas ()
{
  const {
    graph,
    setSelectedNode,
    selectedNode,
    loading,
    searchTerm,
    activeTypes,
    impactResult,
    layoutDirection,
  } = useArchitectureStore();

  const visibleGraph = useMemo(() =>
  {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const nodes = graph.nodes.filter((node) =>
    {
      const matchesType =
        !activeTypes.length ||
        activeTypes.includes(node.type);
      const haystack = [
        node.id,
        node.name,
        node.label,
        node.filePath,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        haystack.includes(normalizedSearch);

      return matchesType && matchesSearch;
    });

    const nodeIds = new Set(nodes.map((node) => node.id));
    const edges = graph.edges.filter(
      (edge) =>
        nodeIds.has(edge.source) && nodeIds.has(edge.target),
    );

    return { nodes, edges };
  }, [activeTypes, graph.edges, graph.nodes, searchTerm]);

  const impacted = useMemo(
    () => new Set(impactResult?.affectedFunctions ?? []),
    [impactResult],
  );

  const selectedDependencies = useMemo(() =>
  {
    if (!selectedNode)
    {
      return {
        upstream: new Set<string>(),
        downstream: new Set<string>(),
      };
    }

    return {
      upstream: new Set(
        graph.edges
          .filter((edge) => edge.target === selectedNode.id)
          .map((edge) => edge.source),
      ),
      downstream: new Set(
        graph.edges
          .filter((edge) => edge.source === selectedNode.id)
          .map((edge) => edge.target),
      ),
    };
  }, [graph.edges, selectedNode]);

  const flowNodes: Node[] = useMemo(() =>
  {
    return visibleGraph.nodes.map((node) =>
    {
      const colors = getNodeColors(node.type);
      const label =
        node.label ||
        node.name ||
        node.id.split(":").pop() ||
        node.id;
      const isSelected = selectedNode?.id === node.id;
      const isUpstream =
        selectedDependencies.upstream.has(node.id);
      const isDownstream =
        selectedDependencies.downstream.has(node.id);
      const isImpacted = impacted.has(node.id);

      return {
        id: node.id,
        data: {
          label: (
            <div className="px-4 py-3.5 text-left">
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <span className="rounded-full bg-white/[0.04] border border-white/[0.05] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] opacity-80" style={{ color: colors.text }}>
                  {node.type.replace("_", " ")}
                </span>
                {(isUpstream || isDownstream || isImpacted) && (
                  <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.85)]" />
                )}
              </div>
              <p className="truncate text-xs font-bold leading-normal">
                {label}
              </p>
              {node.filePath && (
                <p className="mt-1.5 truncate text-[9px] font-mono opacity-40 font-medium">
                  {node.filePath}
                </p>
              )}
            </div>
          ),
        },
        position: {
          x: 0,
          y: 0,
        },
        style: {
          width: NODE_WIDTH,
          minHeight: NODE_HEIGHT,
          background: `linear-gradient(135deg, ${colors.bg}, rgba(5, 8, 12, 0.96))`,
          backdropFilter: "blur(12px)",
          color: colors.text,
          border: `1px solid ${isSelected || isImpacted
              ? "rgba(34, 211, 238, 0.6)"
              : colors.border
            }`,
          borderRadius: 12,
          boxShadow:
            isSelected || isImpacted
              ? "0 0 20px rgba(34, 211, 238, 0.2), inset 0 1px 1px rgba(255,255,255,0.05)"
              : "0 10px 30px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.01)",
          opacity:
            selectedNode &&
              !isSelected &&
              !isUpstream &&
              !isDownstream &&
              !isImpacted
              ? 0.28
              : 1,
          padding: 0,
          overflow: "hidden",
          transition: "all 0.2s ease-in-out",
        },
        className: "architecture-node",
      };
    });
  }, [
    impacted,
    selectedDependencies.downstream,
    selectedDependencies.upstream,
    selectedNode,
    visibleGraph.nodes,
  ]);

  const flowEdges: Edge[] = useMemo(() =>
  {
    return visibleGraph.edges.map((edge, index) =>
    {
      const selectedEdge =
        selectedNode &&
        (edge.source === selectedNode.id ||
          edge.target === selectedNode.id);

      return {
        id:
          edge.id ??
          `${edge.source}-${edge.target}-${index}`,
        source: edge.source,
        target: edge.target,
        animated:
          selectedEdge ||
          edge.relation === "CALLS" ||
          edge.relation === "FLOWS",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: selectedEdge ? "#67e8f9" : "#1e293b",
        },
        style: {
          stroke: selectedEdge ? "#67e8f9" : "#1e293b",
          strokeWidth: selectedEdge ? 2.2 : 1.2,
          opacity: selectedNode && !selectedEdge ? 0.15 : 0.72,
        },
      };
    });
  }, [selectedNode, visibleGraph.edges]);

  const layouted = useMemo(
    () =>
      getLayoutedElements(
        flowNodes,
        flowEdges,
        layoutDirection,
      ),
    [flowNodes, flowEdges, layoutDirection],
  );

  if (loading)
  {
    return (
      <div className="flex h-full items-center justify-center bg-[#06090d] text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading graph
      </div>
    );
  }

  if (!graph.nodes.length)
  {
    return (
      <div className="flex h-full items-center justify-center bg-[#06090d] text-center">
        <div>
          <p className="text-sm font-medium text-slate-300">
            No graph data yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Index the workspace, then refresh this view.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#06090d]">
      <ReactFlow
        nodes={layouted.nodes}
        edges={layouted.edges}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.1}
        maxZoom={1.6}
        onPaneClick={() => setSelectedNode(null)}
        onNodeClick={(_, node) =>
        {
          const selected =
            graph.nodes.find((n) => n.id === node.id) || null;
          setSelectedNode(selected);
        }}
      >
        <Background color="#1f2937" gap={28} size={1} />
        <MiniMap
          pannable
          zoomable
          nodeStrokeColor="#67e8f9"
          nodeColor="#0f172a"
          maskColor="rgba(2,6,23,.72)"
          style={{
            background: "#070a0f",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 10,
          }}
        />
        <Controls
          showInteractive={false}
          className="architecture-controls"
        />
      </ReactFlow>
    </div>
  );
}
