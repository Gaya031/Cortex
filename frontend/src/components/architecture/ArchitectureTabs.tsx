"use client";

import { GitBranch, Network, Workflow } from "lucide-react";
import { GraphViewType } from "../../types/architecture.types";

interface Props {
  activeView: GraphViewType;
  onChange: (view: GraphViewType) => void;
}

export default function ArchitectureTabs({
  activeView,
  onChange,
}: Props) {
  const tabs = [
    {
      key: "dependencies",
      label: "Dependencies",
      icon: GitBranch,
    },
    {
      key: "callgraph",
      label: "Call Graph",
      icon: Network,
    },
    {
      key: "projectflow",
      label: "Project Flow",
      icon: Workflow,
    },
  ];

  return (
    <div className="flex h-12 items-center border-b border-white/[0.08] bg-[#080c12] px-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;

        const active = activeView === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() =>
              onChange(tab.key as GraphViewType)
            }
            className={`flex h-9 cursor-pointer items-center gap-2 rounded-lg px-4 text-xs font-semibold transition ${
              active
                ? "bg-cyan-300 text-slate-950"
                : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
