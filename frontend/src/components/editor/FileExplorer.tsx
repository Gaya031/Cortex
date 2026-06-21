"use client";

import {
  ChevronRight,
  FileCode2,
  Folder,
  FolderOpen,
  MoreHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";

import { FileTreeNode } from "@/types/file.types";

interface FileExplorerProps {
  tree: FileTreeNode[];
  activePath: string | null;
  loading?: boolean;
  onOpenFile: (path: string, split?: boolean) => void;
}

function TreeRow({
  node,
  depth,
  activePath,
  expanded,
  onToggle,
  onOpenFile,
}: {
  node: FileTreeNode;
  depth: number;
  activePath: string | null;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  onOpenFile: (path: string, split?: boolean) => void;
}) {
  const isFolder = node.type === "folder";
  const isExpanded = expanded.has(node.path);
  const isActive = activePath === node.path;

  return (
    <div className="relative">
      {depth > 0 && (
        <div className="pointer-events-none absolute bottom-0 top-0 flex" style={{ left: 14 }}>
          {Array.from({ length: depth }).map((_, i) => (
            <div
              key={i}
              className="h-full border-r border-white/[0.04]"
              style={{ width: 12 }}
            />
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() =>
          isFolder
            ? onToggle(node.path)
            : onOpenFile(node.path)
        }
        onDoubleClick={() => {
          if (!isFolder) {
            onOpenFile(node.path, true);
          }
        }}
        className={`group relative flex h-8 w-full items-center gap-2 rounded-md pr-2 text-left text-[12px] transition-all duration-150 ${
          isActive
            ? "bg-cyan-450/8 text-cyan-200 border-r-2 border-cyan-400 font-semibold"
            : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
        }`}
        style={{ paddingLeft: depth * 12 + 10 }}
      >
        {isFolder ? (
          <ChevronRight
            className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
              isExpanded ? "rotate-90 text-cyan-300" : "text-slate-500"
            }`}
          />
        ) : (
          <span className="h-3.5 w-3.5 shrink-0" />
        )}

        {isFolder ? (
          isExpanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-cyan-300" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-cyan-300 transition-colors" />
          )
        ) : (
          <FileCode2 className={`h-4 w-4 shrink-0 transition-colors ${
            isActive ? "text-cyan-300" : "text-slate-500 group-hover:text-cyan-300"
          }`} />
        )}

        <span className="min-w-0 flex-1 truncate">
          {node.name}
        </span>

        {!isFolder && node.extension && (
          <span className="hidden rounded bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-mono uppercase text-slate-500 group-hover:block border border-white/[0.06]">
            {node.extension.replace(".", "")}
          </span>
        )}
      </button>

      {isFolder && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeRow
              key={child.path}
              node={child}
              depth={depth + 1}
              activePath={activePath}
              expanded={expanded}
              onToggle={onToggle}
              onOpenFile={onOpenFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileExplorer({
  tree,
  activePath,
  loading,
  onOpenFile,
}: FileExplorerProps) {
  const defaultExpanded = useMemo(() => {
    const folders = new Set<string>();
    tree.slice(0, 8).forEach((node) => {
      if (node.type === "folder") {
        folders.add(node.path);
      }
    });
    return folders;
  }, [tree]);

  const [expanded, setExpanded] =
    useState<Set<string>>(defaultExpanded);

  const toggle = (path: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-white/[0.07] bg-[#090d12]">
      <div className="flex h-12 items-center justify-between border-b border-white/[0.07] px-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Explorer
          </p>
          <p className="text-xs text-slate-300">
            {tree.length} roots
          </p>
        </div>
        <button
          type="button"
          disabled
          title="Create, rename, move, and delete need backend endpoints."
          className="rounded-md p-1.5 text-slate-600"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-2 py-2">
        {loading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-7 animate-pulse rounded-md bg-white/[0.04]"
              />
            ))}
          </div>
        ) : tree.length ? (
          tree.map((node) => (
            <TreeRow
              key={node.path}
              node={node}
              depth={0}
              activePath={activePath}
              expanded={expanded}
              onToggle={toggle}
              onOpenFile={onOpenFile}
            />
          ))
        ) : (
          <div className="px-3 py-8 text-sm text-slate-500">
            No indexed files found for this workspace.
          </div>
        )}
      </div>
    </aside>
  );
}
