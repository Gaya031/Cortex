"use client";

import {
  AlertTriangle,
  GitFork,
  Network,
  Workflow,
} from "lucide-react";

import {
  ArchitectureGraph,
  ArchitectureSummary,
} from "@/types/architecture.types";

interface ArchitectureStatsProps {
  graph: ArchitectureGraph;
  summary: ArchitectureSummary | null;
}

export default function ArchitectureStats({
  graph,
  summary,
}: ArchitectureStatsProps) {
  const stats = [
    {
      label: "Nodes",
      value: graph.nodes.length,
      icon: Network,
    },
    {
      label: "Relations",
      value: graph.edges.length,
      icon: GitFork,
    },
    {
      label: "Circular",
      value:
        summary?.metrics?.circularCount ??
        summary?.circularDependencies?.length ??
        0,
      icon: AlertTriangle,
    },
    {
      label: "Critical",
      value:
        summary?.metrics?.criticalCount ??
        summary?.criticalFiles?.length ??
        0,
      icon: Workflow,
    },
  ];

  return (
    <div className="grid grid-cols-4 border-b border-white/[0.07] bg-[#090d12]">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="flex items-center gap-3 border-r border-white/[0.06] px-4 py-3 last:border-r-0"
          >
            <Icon className="h-4 w-4 text-cyan-300" />
            <div>
              <p className="text-lg font-semibold text-white">
                {stat.value}
              </p>
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                {stat.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
