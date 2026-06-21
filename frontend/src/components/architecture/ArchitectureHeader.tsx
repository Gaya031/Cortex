"use client";

import { ArrowLeft, Command, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  workspaceName?: string;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function ArchitectureHeader({
  workspaceName,
  loading,
  onRefresh,
}: Props) {
  const router = useRouter();

  return (
    <div className="flex h-14 items-center justify-between border-b border-white/[0.08] bg-[#090d12] px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
          <Command className="h-4 w-4" />
        </div>

        <div>
          <h1 className="text-sm font-semibold text-white">
            Architecture Explorer
          </h1>

          <p className="text-[11px] text-slate-500">
            {workspaceName ?? "Dependency, call, and flow maps"}
          </p>
        </div>
      </div>

      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-300/35 hover:text-cyan-100 disabled:opacity-50"
      >
        <RefreshCw
          className={`h-3.5 w-3.5 ${
            loading ? "animate-spin text-indigo-400" : ""
          }`}
        />

        Refresh
      </button>
    </div>
  );
}
