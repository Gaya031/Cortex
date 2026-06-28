"use client";

import {
  Activity,
  AlertCircle,
  Command,
  FileCode2,
  Loader2,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import CodeActionsPanel from "@/components/editor/CodeActionsPanel";
import EditorSurface from "@/components/editor/EditorSurface";
import FileExplorer from "@/components/editor/FileExplorer";
import WorkspaceSidebar from "@/components/platform/WorkspaceSidebar";
import { IndexStats, indexerApi } from "@/services/indexer.api";
import { useEditorStore } from "@/store/useEditorStore";

export default function WorkspaceShell({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const {
    files,
    tree,
    tabs,
    activePath,
    splitPath,
    splitEnabled,
    loadingFiles,
    loadingContent,
    saving,
    aiLoading,
    aiResult,
    searchTerm,
    replaceTerm,
    error,
    loadFiles,
    openFile,
    setActivePath,
    closeTab,
    updateActiveContent,
    saveActiveFile,
    toggleSplit,
    setSearchTerm,
    setReplaceTerm,
    replaceInActiveFile,
    explainActiveFile,
    planRefactor,
    refreshOpenTabs,
    clearAiResult,
    refactorPlan,
  } = useEditorStore();

  const [indexStats, setIndexStats] = useState<IndexStats | null>(null);

  useEffect(() => {
    loadFiles(workspaceId);
  }, [loadFiles, workspaceId]);

  useEffect(() => {
    indexerApi.getStats(workspaceId).then(setIndexStats).catch(() => null);
  }, [workspaceId, files.length]);

  const stats = useMemo(() => {
    const languages = new Set(
      files.map((file) => file.language).filter(Boolean),
    );
    const totalSize = files.reduce(
      (sum, file) => sum + (file.size || 0),
      0,
    );

    return {
      files: files.length,
      languages: languages.size,
      size:
        totalSize > 1024 * 1024
          ? `${(totalSize / 1024 / 1024).toFixed(1)} MB`
          : `${Math.max(1, Math.round(totalSize / 1024))} KB`,
    };
  }, [files]);

  return (
    <main className="flex h-screen overflow-hidden bg-[#06090d] text-slate-100">
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#090d12]/95 px-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-300 text-slate-950 shadow-[0_0_30px_rgba(103,232,249,0.25)]">
              <Command className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">
                Cortex
              </h1>
              <p className="text-[11px] text-slate-500">
                Neural Intelligence for Code
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-5 text-xs text-slate-500 md:flex">
            <span className="flex items-center gap-2">
              <FileCode2 className="h-3.5 w-3.5 text-cyan-300" />
              {stats.files} files
            </span>
            <span className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              {stats.languages} languages
            </span>
            <span className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-emerald-300" />
              {indexStats
                ? `${indexStats.embeddingsReady}/${indexStats.embeddableChunks} embedded (${indexStats.embeddingCoverage}%)`
                : stats.size}
            </span>
          </div>
        </header>

        {error && (
          <div className="flex h-10 shrink-0 items-center gap-2 border-b border-amber-300/20 bg-amber-300/10 px-4 text-xs text-amber-100">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {loadingFiles && !files.length ? (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading workspace index
          </div>
        ) : (
          <div className="flex min-h-0 flex-1">
            <FileExplorer
              tree={tree}
              activePath={activePath}
              loading={loadingFiles}
              onOpenFile={(path, split) =>
                openFile(
                  workspaceId,
                  path,
                  split ? "split" : "main",
                )
              }
            />
            <EditorSurface
              workspaceId={workspaceId}
              tabs={tabs}
              activePath={activePath}
              splitPath={splitPath}
              splitEnabled={splitEnabled}
              searchTerm={searchTerm}
              replaceTerm={replaceTerm}
              loadingContent={loadingContent}
              saving={saving}
              aiLoading={aiLoading}
              aiResult={aiResult}
              onSetActive={setActivePath}
              onCloseTab={closeTab}
              onUpdateContent={updateActiveContent}
              onSave={() => saveActiveFile(workspaceId)}
              onToggleSplit={toggleSplit}
              onSearchTerm={setSearchTerm}
              onReplaceTerm={setReplaceTerm}
              onReplace={replaceInActiveFile}
              onExplain={() => explainActiveFile(workspaceId)}
              onRefactor={() => planRefactor(workspaceId)}
              onCloseAI={clearAiResult}
            />
            <CodeActionsPanel
              workspaceId={workspaceId}
              activePath={activePath}
              openFilePaths={tabs.map((tab) => tab.path)}
              refactorPlan={refactorPlan}
              onComplete={async () => {
                await loadFiles(workspaceId);
                await refreshOpenTabs(workspaceId);
              }}
            />
          </div>
        )}
      </section>
      <WorkspaceSidebar workspaceId={workspaceId} />
    </main>
  );
}
