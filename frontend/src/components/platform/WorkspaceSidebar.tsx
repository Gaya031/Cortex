"use client";

import {
  BrainCircuit,
  FileCode2,
  Gauge,
  GitBranch,
  LayoutDashboard,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { indexerApi } from "@/services/indexer.api";

const navItems = [
  {
    label: "Editor",
    href: "",
    icon: FileCode2,
  },
  {
    label: "Architecture",
    href: "/architecture",
    icon: GitBranch,
  },
  {
    label: "Insights",
    href: "/insights",
    icon: Gauge,
  },
];

export default function WorkspaceSidebar({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const pathname = usePathname();
  const [reindexing, setReindexing] = useState(false);
  const [status, setStatus] = useState("");

  const reindex = async () => {
    try {
      setReindexing(true);
      setStatus("");
      const message = await indexerApi.reindex(workspaceId);
      setStatus(message);
    } catch {
      setStatus("Could not start reindex.");
    } finally {
      setReindexing(false);
    }
  };

  return (
    <aside className="relative flex h-screen w-14 shrink-0 flex-col items-center border-l border-white/[0.06] bg-[#04080d] py-3 gap-1">
      {/* Logo */}
      <Link
        href="/"
        title="Cortex Dashboard"
        className="group mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 text-white shadow-[0_0_24px_rgba(103,232,249,0.18)] transition hover:shadow-[0_0_30px_rgba(103,232,249,0.35)]"
      >
        <BrainCircuit className="h-5 w-5" />
      </Link>

      {/* Dashboard */}
      <NavIcon
        href="/"
        label="Dashboard"
        icon={LayoutDashboard}
        active={false}
      />

      <div className="my-1 h-px w-8 bg-white/[0.06]" />

      {/* Workspace nav items */}
      {navItems.map((item) => {
        const href = `/workspace/${workspaceId}${item.href}`;
        const active =
          item.href === ""
            ? pathname === href
            : pathname?.startsWith(href);
        const Icon = item.icon;

        return (
          <NavIcon
            key={item.label}
            href={href}
            label={item.label}
            icon={Icon}
            active={active}
          />
        );
      })}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Reindex */}
      <div className="group relative">
        <button
          type="button"
          onClick={reindex}
          disabled={reindexing}
          title="Reindex workspace"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-950/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.02)] hover:bg-cyan-500/10 transition-all duration-300 disabled:opacity-50 active:scale-95 cursor-pointer"
        >
          {reindexing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </button>
        <Tooltip label={reindexing ? "Reindexing…" : status || "Reindex"} />
      </div>
    </aside>
  );
}

function NavIcon({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof FileCode2;
  active: boolean;
}) {
  return (
    <div className="group relative">
      <Link
        href={href}
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
          active
            ? "bg-cyan-400/10 text-cyan-300 border border-cyan-400/25 shadow-[0_0_12px_rgba(34,211,238,0.08)]"
            : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent"
        }`}
      >
        <Icon className="h-4 w-4" />
      </Link>
      <Tooltip label={label} />
    </div>
  );
}

function Tooltip({ label }: { label: string }) {
  return (
    <div className="pointer-events-none absolute right-full top-1/2 mr-2.5 -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/[0.08] bg-[#0c1118] px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 opacity-0 shadow-xl transition-all duration-150 group-hover:opacity-100 group-hover:-translate-x-0">
      {label}
    </div>
  );
}
