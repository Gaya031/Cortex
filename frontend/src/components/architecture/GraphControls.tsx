"use client";

import {
  Boxes,
  Braces,
  CircleDot,
  FileCode2,
  FunctionSquare,
  LayoutGrid,
  RotateCcw,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import { useArchitectureStore } from "../../store/useArchitectureStore";

const filters = [
  {
    type: "FILE",
    label: "Files",
    icon: FileCode2,
  },
  {
    type: "FUNCTION",
    label: "Functions",
    icon: FunctionSquare,
  },
  {
    type: "COMPONENT",
    label: "Components",
    icon: Boxes,
  },
  {
    type: "CLASS",
    label: "Classes",
    icon: Braces,
  },
  {
    type: "ENTRY",
    label: "Entry",
    icon: CircleDot,
  },
];

interface GraphControlsProps {
  activeTypes: string[];
  onToggleType: (type: string) => void;
  onClear: () => void;
}

export default function GraphControls({
  activeTypes,
  onToggleType,
  onClear,
}: GraphControlsProps) {
  const { layoutDirection, setLayoutDirection, requestLayoutReset } =
    useArchitectureStore();

  return (
    <div className="flex items-center gap-1">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const active = activeTypes.includes(filter.type);

        return (
          <button
            key={filter.type}
            type="button"
            onClick={() => onToggleType(filter.type)}
            title={filter.label}
            className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition ${
              active
                ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-100"
                : "border-white/[0.08] bg-white/[0.025] text-slate-500 hover:text-slate-200"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">
              {filter.label}
            </span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={requestLayoutReset}
        title="Reset auto layout"
        className="ml-1 rounded-lg border border-white/[0.08] p-2 text-slate-500 transition hover:bg-white/[0.04] hover:text-cyan-200"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onClear}
        title="Clear filters"
        className="rounded-lg border border-white/[0.08] p-2 text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-200"
      >
        <RotateCcw className="h-4 w-4" />
      </button>

      {/* Layout Direction Selector */}
      <div className="ml-2 flex items-center gap-1 border-l border-white/[0.08] pl-2">
        <button
          type="button"
          onClick={() => setLayoutDirection("LR")}
          title="Horizontal Layout (Left-to-Right)"
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
            layoutDirection === "LR"
              ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.15)]"
              : "border-white/[0.08] bg-white/[0.025] text-slate-500 hover:text-slate-200"
          }`}
        >
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setLayoutDirection("TB")}
          title="Vertical Layout (Top-to-Bottom)"
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
            layoutDirection === "TB"
              ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.15)]"
              : "border-white/[0.08] bg-white/[0.025] text-slate-500 hover:text-slate-200"
          }`}
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
