"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  FileCode2,
  Gauge,
  Loader2,
  Network,
  Sparkles,
} from "lucide-react";

import { useArchitectureStore } from "../../store/useArchitectureStore";

interface NodeDetailsPanelProps {
  workspaceId: string;
}

const CALLABLE_TYPES = new Set([
  "FUNCTION",
  "METHOD",
  "COMPONENT",
  "CLASS",
]);

function resolveNodeFilePath(node: {
  id: string;
  filePath?: string;
  type: string;
}): string | null {
  if (node.filePath) return node.filePath;
  if (node.id.startsWith("file:")) {
    return node.id.replace(/^file:/, "");
  }
  if (node.type === "FILE") {
    return node.id.replace(/^file:/, "");
  }
  const parts = node.id.split(":");
  if (parts.length >= 3) return parts[0];
  return null;
}

export default function NodeDetailsPanel({
  workspaceId,
}: NodeDetailsPanelProps) {
  const {
    selectedNode,
    graph,
    impactResult,
    fileImpactResult,
    downstreamResult,
    loading,
    loadImpact,
    loadFileImpact,
    loadDownstreamImpact,
  } = useArchitectureStore();

  if (!selectedNode) {
    return (
      <div className="w-[340px] min-w-[340px] overflow-y-auto border-l border-white/[0.07] bg-[#0b1017] p-5">
        <h3 className="mb-2 text-sm font-semibold text-white">
          Node Details
        </h3>
        <p className="text-sm leading-6 text-slate-500">
          Select a node to inspect callers, downstream impact,
          and risk level.
        </p>
      </div>
    );
}

  const outgoing = graph.edges.filter(
    (edge) => edge.source === selectedNode.id,
  );
  const incoming = graph.edges.filter(
    (edge) => edge.target === selectedNode.id,
  );
  const degree = incoming.length + outgoing.length;
  const risk =
    selectedNode.riskScore ??
    (degree >= 10 ? 92 : degree >= 5 ? 63 : degree >= 2 ? 34 : 12);
  const riskLabel =
    risk >= 70 ? "High" : risk >= 40 ? "Medium" : "Low";
  const isCallable = CALLABLE_TYPES.has(selectedNode.type);
  const resolvedFilePath = resolveNodeFilePath(selectedNode);
  const isFile =
    selectedNode.type === "FILE" ||
    selectedNode.id.startsWith("file:") ||
    Boolean(resolvedFilePath);

  return (
    <div className="w-[340px] min-w-[340px] shrink-0 overflow-y-auto border-l border-white/[0.06] bg-[#05080c]">
      <div className="border-b border-white/[0.06] p-5 bg-[#080d14]/40">
        <div className="mb-3 flex items-center gap-2">
          <Network className="h-4 w-4 text-cyan-300" />
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Selected Node
          </p>
        </div>
        <h3 className="break-words text-base font-bold leading-6 text-white">
          {selectedNode.label || selectedNode.name || selectedNode.id}
        </h3>
        <p className="mt-2.5 inline-flex rounded-full border border-cyan-400/25 bg-cyan-950/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-200">
          {selectedNode.type}
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              label: "Calls",
              value: outgoing.length,
              icon: ArrowDownRight,
            },
            {
              label: "Called By",
              value: incoming.length,
              icon: ArrowUpRight,
            },
            {
              label: "Risk",
              value: riskLabel,
              icon: Gauge,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isHigh = item.value === "High";
            const isMedium = item.value === "Medium";
            
            return (
              <div
                key={item.label}
                className="rounded-xl border border-white/[0.06] bg-[#03060b]/40 p-3 shadow-md"
              >
                <Icon className="mb-2 h-4 w-4 text-cyan-300" />
                <p className={`text-xs font-bold ${
                  isHigh ? "text-rose-400" : isMedium ? "text-amber-400" : "text-white"
                }`}>
                  {item.value}
                </p>
                <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        {selectedNode.filePath && (
          <div>
            <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <FileCode2 className="h-3.5 w-3.5" />
              Path
            </p>
            <p className="break-all rounded-xl border border-white/[0.08] bg-[#03060b]/40 p-3 text-xs font-mono leading-5 text-slate-350 select-text">
              {selectedNode.filePath}
            </p>
          </div>
        )}

        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Node Id
          </p>
          <p className="break-all rounded-xl border border-white/[0.08] bg-[#03060b]/40 p-3 text-xs font-mono leading-5 text-slate-500 select-text">
            {selectedNode.id}
          </p>
        </div>

        <div className="space-y-2">
          {isCallable && (
            <>
              <button
                type="button"
                onClick={() =>
                  loadImpact(workspaceId, selectedNode.id)
                }
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 text-xs font-bold text-slate-950 shadow-[0_2px_12px_rgba(34,211,238,0.15)] hover:from-cyan-300 hover:to-cyan-200 transition-all duration-300 active:scale-95 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Upstream impact
              </button>
              <button
                type="button"
                onClick={() =>
                  loadDownstreamImpact(workspaceId, selectedNode.id)
                }
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-950/10 text-xs font-bold text-cyan-200 hover:bg-cyan-500/10 transition-all duration-300 active:scale-95 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                Downstream impact
              </button>
            </>
          )}

          {isFile && resolvedFilePath && (
            <button
              type="button"
              onClick={() =>
                loadFileImpact(workspaceId, resolvedFilePath)
              }
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-950/10 text-xs font-bold text-amber-200 hover:bg-amber-500/10 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileCode2 className="h-4 w-4" />
              )}
              File import impact
            </button>
          )}
        </div>

        {impactResult && (
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-950/10 p-4 shadow-lg">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4" />
              Upstream impact {impactResult.impactScore}
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {impactResult.affectedFunctions?.length ? (
                impactResult.affectedFunctions.map((item) => (
                  <p
                    key={item}
                    className="rounded-lg bg-black/30 border border-white/[0.04] px-2.5 py-1.5 text-[10px] font-mono text-slate-350 truncate"
                  >
                    {item}
                  </p>
                ))
              ) : (
                <p className="text-xs text-slate-500">
                  No affected functions returned.
                </p>
              )}
            </div>
          </div>
        )}

        {downstreamResult && (
          <div className="rounded-xl border border-indigo-400/20 bg-indigo-950/10 p-4 shadow-lg">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              <ArrowDownRight className="h-4 w-4" />
              Downstream impact {downstreamResult.downStreamImpactScore}
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {downstreamResult.affectedFunctions?.length ? (
                downstreamResult.affectedFunctions.map((item) => (
                  <p
                    key={item}
                    className="rounded-lg bg-black/30 border border-white/[0.04] px-2.5 py-1.5 text-[10px] font-mono text-slate-350 truncate"
                  >
                    {item}
                  </p>
                ))
              ) : (
                <p className="text-xs text-slate-500">
                  No downstream functions affected.
                </p>
              )}
            </div>
          </div>
        )}

        {fileImpactResult && (
          <div className="rounded-xl border border-amber-400/20 bg-amber-950/10 p-4 shadow-lg">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <FileCode2 className="h-4 w-4" />
              File impact {fileImpactResult.impactScore}
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {fileImpactResult.affectedFiles?.length ? (
                fileImpactResult.affectedFiles.map((item) => (
                  <p
                    key={item}
                    className="rounded-lg bg-black/30 border border-white/[0.04] px-2.5 py-1.5 text-[10px] font-mono text-slate-350 truncate"
                  >
                    {item}
                  </p>
                ))
              ) : (
                <p className="text-xs text-slate-500">
                  No dependent files affected.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
