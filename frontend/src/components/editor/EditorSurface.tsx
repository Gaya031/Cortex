"use client";

import Editor from "@monaco-editor/react";
import {
  Bot,
  Columns2,
  FileText,
  GitBranch,
  Loader2,
  PanelRightClose,
  Replace,
  Save,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";

import { EditorTab } from "@/types/file.types";
import { getFileName } from "@/utils/files/buildFileTree";

interface EditorSurfaceProps {
  workspaceId: string;
  tabs: EditorTab[];
  activePath: string | null;
  splitPath: string | null;
  splitEnabled: boolean;
  searchTerm: string;
  replaceTerm: string;
  loadingContent?: boolean;
  saving?: boolean;
  aiLoading?: boolean;
  aiResult?: string;
  onSetActive: (path: string) => void;
  onCloseTab: (path: string) => void;
  onUpdateContent: (content: string) => void;
  onSave: () => void;
  onToggleSplit: () => void;
  onSearchTerm: (term: string) => void;
  onReplaceTerm: (term: string) => void;
  onReplace: () => void;
  onExplain: () => void;
  onRefactor: () => void;
  onCloseAI?: () => void;
}


function EditorPane({
  tab,
  readonly,
  onChange,
}: {
  tab: EditorTab | undefined;
  readonly?: boolean;
  onChange?: (content: string) => void;
}) {
  if (!tab) {
    return (
      <div className="flex h-full items-center justify-center bg-[#070a0f]">
        <div className="text-center">
          <FileText className="mx-auto mb-4 h-10 w-10 text-slate-700" />
          <p className="text-sm font-medium text-slate-300">
            Open a file to begin
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Double-click a file to send it into split view.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      path={tab.path}
      language={tab.language}
      value={tab.content}
      theme="vs-dark"
      options={{
        readOnly: readonly,
        minimap: { enabled: true, scale: 0.8 },
        fontSize: 13,
        fontLigatures: true,
        fontFamily:
          "JetBrains Mono, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        lineHeight: 22,
        smoothScrolling: true,
        cursorBlinking: "smooth",
        scrollBeyondLastLine: false,
        padding: { top: 18, bottom: 18 },
        wordWrap: "on",
        automaticLayout: true,
      }}
      onChange={(value) => {
        if (!readonly) {
          onChange?.(value ?? "");
        }
      }}
      beforeMount={(monaco) => {
        monaco.editor.defineTheme("aether-dark", {
          base: "vs-dark",
          inherit: true,
          rules: [
            { token: "comment", foreground: "6b7280" },
            { token: "keyword", foreground: "7dd3fc" },
            { token: "string", foreground: "86efac" },
            { token: "number", foreground: "fbbf24" },
          ],
          colors: {
            "editor.background": "#070a0f",
            "editor.lineHighlightBackground": "#11182799",
            "editorCursor.foreground": "#22d3ee",
            "editor.selectionBackground": "#155e7580",
            "editorLineNumber.foreground": "#334155",
            "editorLineNumber.activeForeground": "#cbd5e1",
          },
        });
      }}
      onMount={(_, monaco) => {
        monaco.editor.setTheme("aether-dark");
      }}
    />
  );
}

export default function EditorSurface({
  workspaceId,
  tabs,
  activePath,
  splitPath,
  splitEnabled,
  searchTerm,
  replaceTerm,
  loadingContent,
  saving,
  aiLoading,
  aiResult,
  onSetActive,
  onCloseTab,
  onUpdateContent,
  onSave,
  onToggleSplit,
  onSearchTerm,
  onReplaceTerm,
  onReplace,
  onExplain,
  onRefactor,
  onCloseAI,
}: EditorSurfaceProps) {
  const activeTab = tabs.find(
    (tab) => tab.path === activePath,
  );
  const splitTab = tabs.find((tab) => tab.path === splitPath);

  const renderAIResult = (text: string | undefined) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).trim().split("\n");
        const lang = lines[0] && !lines[0].includes(" ") ? lines[0] : "";
        const code = lang ? lines.slice(1).join("\n") : lines.join("\n");
        return (
          <div key={index} className="my-3 rounded-xl border border-white/[0.06] bg-[#02050a] overflow-hidden font-mono text-[11px] leading-5">
            {lang && (
              <div className="border-b border-white/[0.04] bg-white/[0.015] px-3 py-1.5 text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                {lang}
              </div>
            )}
            <pre className="p-3 overflow-x-auto text-cyan-200/90">{code}</pre>
          </div>
        );
      }
      return (
        <span key={index} className="block whitespace-pre-wrap leading-relaxed text-slate-350 font-sans text-xs mb-3">
          {part}
        </span>
      );
    });
  };

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-[#070a0f]">
      <div className="flex h-12 items-center justify-between border-b border-white/[0.06] bg-[#0a0f16]">
        <div className="flex min-w-0 flex-1 items-center overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const active = tab.path === activePath;

            return (
              <button
                key={tab.path}
                type="button"
                onClick={() => onSetActive(tab.path)}
                className={`group flex h-12 max-w-[230px] shrink-0 items-center gap-2 border-r border-white/[0.05] px-4 text-xs font-semibold transition-all relative ${
                  active
                    ? "bg-[#0b0f17] text-cyan-300 border-b border-b-cyan-400"
                    : "text-slate-500 hover:bg-white/[0.015] hover:text-slate-300"
                }`}
              >
                <span className="truncate">
                  {getFileName(tab.path)}
                </span>
                {tab.dirty && (
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
                )}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    onCloseTab(tab.path);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.stopPropagation();
                      onCloseTab(tab.path);
                    }
                  }}
                  className="rounded p-0.5 text-slate-600 opacity-0 transition-opacity hover:bg-white/[0.08] hover:text-slate-200 group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 px-2 border-l border-white/[0.05]">
          <Link
            href={`/workspace/${workspaceId}/architecture`}
            title="Architecture"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.05] hover:text-cyan-200"
          >
            <GitBranch className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={onToggleSplit}
            title="Toggle split editor"
            className={`rounded-lg p-2 transition ${
              splitEnabled
                ? "bg-cyan-450/10 text-cyan-300"
                : "text-slate-400 hover:bg-white/[0.05] hover:text-cyan-200"
            }`}
          >
            {splitEnabled ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <Columns2 className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!activeTab || saving}
            title="Save file"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.05] hover:text-emerald-300 disabled:opacity-40"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex h-12 items-center gap-2 border-b border-white/[0.06] bg-[#05080d] px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Search className="h-3.5 w-3.5 text-slate-600" />
          <input
            value={searchTerm}
            onChange={(event) =>
              onSearchTerm(event.target.value)
            }
            placeholder="Search in active file"
            className="h-8 min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-[#090d15]/50 px-3 text-[11px] text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
          />
          <Replace className="h-3.5 w-3.5 text-slate-600" />
          <input
            value={replaceTerm}
            onChange={(event) =>
              onReplaceTerm(event.target.value)
            }
            placeholder="Replace"
            className="h-8 min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-[#090d15]/50 px-3 text-[11px] text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40"
          />
          <button
            type="button"
            onClick={onReplace}
            disabled={!searchTerm || !activeTab}
            className="h-8 rounded-lg border border-white/[0.08] px-3 text-[11px] font-bold text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-100 disabled:opacity-40 cursor-pointer"
          >
            Replace All
          </button>
        </div>

        <button
          type="button"
          onClick={onExplain}
          disabled={!activeTab || aiLoading}
          className="flex h-8 items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-300 px-3 text-[11px] font-bold text-slate-950 shadow-[0_2px_10px_rgba(34,211,238,0.15)] hover:from-cyan-300 hover:to-cyan-200 transition-all duration-300 disabled:opacity-50 active:scale-95 cursor-pointer"
        >
          <Bot className="h-3.5 w-3.5" />
          Explain
        </button>
        <button
          type="button"
          onClick={onRefactor}
          disabled={!activeTab || aiLoading}
          className="flex h-8 items-center gap-2 rounded-lg border border-cyan-400/30 px-3 text-[11px] font-bold text-cyan-200 hover:bg-cyan-500/10 transition-all duration-300 disabled:opacity-50 active:scale-95 cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Refactor
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1">
          {loadingContent ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Opening file
            </div>
          ) : (
            <EditorPane
              tab={activeTab}
              onChange={onUpdateContent}
            />
          )}
        </div>

        {splitEnabled && (
          <div className="min-w-0 flex-1 border-l border-white/[0.06]">
            <EditorPane tab={splitTab ?? activeTab} readonly />
          </div>
        )}

        {(aiResult || aiLoading) && (
          <aside className="flex w-[360px] shrink-0 flex-col border-l border-white/[0.06] bg-[#05080c]">
          <div className="border-b border-white/[0.06] px-4 py-3 bg-[#080d14]/40 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-100">
                  AI Notes
                </p>
                <button type="button" onClick={onCloseAI} className="text-slate-500 hover:text-slate-200">
                  <X className="h-4 w-4" />
                </button>
              </div>
            <div className="min-h-0 flex-1 overflow-auto px-5 py-5 text-sm leading-6 text-slate-300">
              {aiLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking through the file
                </div>
              ) : (
                renderAIResult(aiResult)
              )}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
