"use client";

import {
  GitBranch,
  Network,
  Workflow,
} from "lucide-react";

import { GraphViewType } from "@/types/architecture.types";

const sections: {
  key: GraphViewType;
  title: string;
  layer: string;
  question: string;
  description: string;
  examples: string[];
  icon: typeof GitBranch;
}[] = [
  {
    key: "dependencies",
    title: "Dependency Graph",
    layer: "Architecture Layer",
    question: "How is the code organized?",
    description:
      "Shows imports and structural relationships between files, modules, components, classes, and functions.",
    examples: [
      "Circular dependencies",
      "Highly coupled files",
      "Dead or orphan files",
    ],
    icon: GitBranch,
  },
  {
    key: "callgraph",
    title: "Call Graph",
    layer: "Relationship Layer",
    question: "Who calls whom?",
    description:
      "Shows function and component call relationships for impact analysis, bug tracing, and safe refactoring.",
    examples: [
      "Upstream callers",
      "Downstream calls",
      "Function impact",
    ],
    icon: Network,
  },
  {
    key: "projectflow",
    title: "Project Flow Graph",
    layer: "Execution Layer",
    question: "How does the application run?",
    description:
      "Shows runtime execution flow such as browser, route, controller, service, cache, database, and response paths.",
    examples: [
      "Request lifecycle",
      "Feature flow",
      "System journey",
    ],
    icon: Workflow,
  },
];

interface ArchitectureGraphSectionsProps {
  activeView: GraphViewType;
  onChange: (view: GraphViewType) => void;
}

export default function ArchitectureGraphSections({
  activeView,
  onChange,
}: ArchitectureGraphSectionsProps) {
  return (
    <div className="grid gap-3 border-b border-white/[0.07] bg-[#080c12] p-4 xl:grid-cols-3">
      {sections.map((section) => {
        const Icon = section.icon;
        const active = activeView === section.key;

        return (
          <button
            key={section.key}
            type="button"
            onClick={() => onChange(section.key)}
            className={`min-w-0 rounded-xl border p-4 text-left transition ${
              active
                ? "border-cyan-300/35 bg-cyan-300/10"
                : "border-white/[0.08] bg-white/[0.025] hover:border-white/[0.16] hover:bg-white/[0.04]"
            }`}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    active
                      ? "bg-cyan-300 text-slate-950"
                      : "bg-white/[0.05] text-cyan-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {section.title}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {section.layer}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-cyan-100">
              {section.question}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {section.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {section.examples.map((example) => (
                <span
                  key={example}
                  className="rounded-full bg-black/20 px-2 py-1 text-[10px] text-slate-400"
                >
                  {example}
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
