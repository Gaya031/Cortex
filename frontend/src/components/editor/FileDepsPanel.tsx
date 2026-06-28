"use client";

import { ArrowDownRight, ArrowUpRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { graphApi } from "@/services/graph.api";

export default function FileDepsPanel({
  workspaceId,
  activePath,
}: {
  workspaceId: string;
  activePath: string | null;
}) {
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [dependents, setDependents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activePath) {
      setDependencies([]);
      setDependents([]);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const [deps, depsOn] = await Promise.all([
          graphApi.getDependencies(workspaceId, activePath),
          graphApi.getDependents(workspaceId, activePath),
        ]);
        if (!cancelled) {
          setDependencies(deps);
          setDependents(depsOn);
        }
      } catch {
        if (!cancelled) {
          setDependencies([]);
          setDependents([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, activePath]);

  if (!activePath) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-[#03060b]/40 p-4 text-xs text-slate-500">
        Open a file to see imports and dependents.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading dependency graph
        </div>
      )}

      <section>
        <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <ArrowDownRight className="h-3.5 w-3.5 text-cyan-300" />
          Imports ({dependencies.length})
        </p>
        <div className="max-h-36 space-y-1 overflow-y-auto">
          {dependencies.length ? (
            dependencies.map((file) => (
              <p
                key={file}
                className="truncate rounded-lg border border-white/[0.04] bg-black/20 px-2 py-1 text-[10px] font-mono text-slate-400"
              >
                {file}
              </p>
            ))
          ) : (
            <p className="text-xs text-slate-600">No indexed imports.</p>
          )}
        </div>
      </section>

      <section>
        <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <ArrowUpRight className="h-3.5 w-3.5 text-amber-300" />
          Dependents ({dependents.length})
        </p>
        <div className="max-h-36 space-y-1 overflow-y-auto">
          {dependents.length ? (
            dependents.map((file) => (
              <p
                key={file}
                className="truncate rounded-lg border border-white/[0.04] bg-black/20 px-2 py-1 text-[10px] font-mono text-slate-400"
              >
                {file}
              </p>
            ))
          ) : (
            <p className="text-xs text-slate-600">No dependents found.</p>
          )}
        </div>
      </section>
    </div>
  );
}
