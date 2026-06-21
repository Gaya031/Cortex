"use client";

import {
  ArrowRightLeft,
  Bot,
  Camera,
  FileSearch,
  Loader2,
  PenLine,
  RotateCcw,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import {
  astRefactorApi,
  DiffFile,
  MovePreview,
} from "@/services/astRefactor.api";
import { assistantApi } from "@/services/assistant.api";
import {
  snapshotApi,
  WorkspaceSnapshot,
} from "@/services/snapshot.api";
import { RefactorPlanResult } from "@/store/useEditorStore";

interface CodeActionsPanelProps {
  workspaceId: string;
  activePath: string | null;
  openFilePaths: string[];
  onComplete: () => void;
  refactorPlan?: RefactorPlanResult | null;
}

export default function CodeActionsPanel({
  workspaceId,
  activePath,
  openFilePaths,
  onComplete,
  refactorPlan,
}: CodeActionsPanelProps) {
  const [activeTool, setActiveTool] = useState<
    "chat" | "actions" | "snapshots" | "diff" | "plan"
  >("chat");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [oldName, setOldName] = useState("");
  const [newName, setNewName] = useState("");
  const [moveName, setMoveName] = useState("");
  const [sourceFile, setSourceFile] = useState(activePath ?? "");
  const [targetFile, setTargetFile] = useState("");
  const [loading, setLoading] = useState<"rename" | "move" | null>(
    null,
  );
  const [panelLoading, setPanelLoading] = useState<
    "chat" | "preview" | "snapshot" | "restore" | null
  >(null);
  const [message, setMessage] = useState("");
  const [diffFiles, setDiffFiles] = useState<DiffFile[]>([]);
  const [snapshots, setSnapshots] = useState<WorkspaceSnapshot[]>([]);

  // Auto-switch to plan tab when a new refactor plan arrives
  useEffect(() => {
    if (refactorPlan) {
      setActiveTool("plan");
    }
  }, [refactorPlan]);

  const ask = async (event: FormEvent) => {
    event.preventDefault();
    if (!question.trim()) return;

    try {
      setPanelLoading("chat");
      // Add user question to messages
      setMessages((prev) => [...prev, { role: "user", content: question }]);
      setAnswer("");
      const result = await assistantApi.askRepository(
        workspaceId,
        question,
      );
      // Append assistant answer to messages
      setMessages((prev) => [...prev, { role: "assistant", content: result.answer }]);
      setAnswer(result.answer);
    } catch {
      setAnswer("Could not get an answer from the server.");
    } finally {
      setPanelLoading(null);
    }
  };

  const previewRename = async () => {
    if (!oldName || !newName) return;

    try {
      setPanelLoading("preview");
      const preview = await astRefactorApi.previewRenameFunction(
        workspaceId,
        oldName,
        newName,
      );
      setDiffFiles(preview.affectedFiles);
      setActiveTool("diff");
    } catch {
      setMessage("Could not create rename diff preview.");
    } finally {
      setPanelLoading(null);
    }
  };

  const previewMove = async () => {
    const source = sourceFile || activePath;
    if (!moveName || !source || !targetFile) return;

    try {
      setPanelLoading("preview");
      const preview: MovePreview =
        await astRefactorApi.previewMoveFunction(
          workspaceId,
          moveName,
          source,
          targetFile,
        );
      setDiffFiles([preview.source, preview.target]);
      setActiveTool("diff");
    } catch {
      setMessage("Could not create move diff preview.");
    } finally {
      setPanelLoading(null);
    }
  };

  const rename = async (event: FormEvent) => {
    event.preventDefault();
    if (!oldName || !newName || loading) return;

    try {
      setLoading("rename");
      setMessage("");
      const result = await astRefactorApi.renameFunction(
        workspaceId,
        oldName,
        newName,
      );
      setMessage(
        `Renamed ${result.renamed} to ${result.newName} in ${result.filesUpdated} files. Reindex completed.`,
      );
      await previewRename();
      onComplete();
    } catch {
      setMessage("Rename failed. Check the function names.");
    } finally {
      setLoading(null);
    }
  };

  const move = async (event: FormEvent) => {
    event.preventDefault();
    const source = sourceFile || activePath;
    if (!moveName || !source || !targetFile || loading) return;

    try {
      setLoading("move");
      setMessage("");
      const result = await astRefactorApi.moveFunction(
        workspaceId,
        moveName,
        source,
        targetFile,
      );
      setMessage(
        `Moved ${result.movedFunction} from ${result.sourceFile} to ${result.targetFile}. Imports updated and reindex completed.`,
      );
      await previewMove();
      onComplete();
    } catch {
      setMessage("Move failed. Check source and target file paths.");
    } finally {
      setLoading(null);
    }
  };

  const createSnapshot = async () => {
    const filePaths = openFilePaths.length
      ? openFilePaths
      : activePath
        ? [activePath]
        : [];

    if (!filePaths.length) {
      setMessage("Open at least one file before creating a snapshot.");
      return;
    }

    try {
      setPanelLoading("snapshot");
      await snapshotApi.create(workspaceId, filePaths);
      setMessage(`Snapshot created for ${filePaths.length} file(s).`);
      await loadSnapshots();
    } catch {
      setMessage("Could not create snapshot.");
    } finally {
      setPanelLoading(null);
    }
  };

  const loadSnapshots = async () => {
    try {
      setPanelLoading("snapshot");
      const result = await snapshotApi.list(workspaceId);
      setSnapshots(result);
    } catch {
      setMessage("Could not load snapshots.");
    } finally {
      setPanelLoading(null);
    }
  };

  const restoreSnapshot = async (snapshotId: string) => {
    try {
      setPanelLoading("restore");
      const result = await snapshotApi.restore(snapshotId);
      setMessage(`Restored ${result.restored} file(s).`);
      onComplete();
    } catch {
      setMessage("Could not restore snapshot.");
    } finally {
      setPanelLoading(null);
    }
  };

  const renderChatAnswer = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).trim().split("\n");
        const lang = lines[0] && !lines[0].includes(" ") ? lines[0] : "";
        const code = lang ? lines.slice(1).join("\n") : lines.join("\n");
        return (
          <div key={index} className="my-2.5 rounded-xl border border-white/[0.06] bg-[#02050a] overflow-hidden font-mono text-[10px] leading-5">
            {lang && (
              <div className="border-b border-white/[0.04] bg-white/[0.015] px-3 py-1.5 text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                {lang}
              </div>
            )}
            <pre className="p-3 overflow-x-auto text-cyan-200/90 select-text">{code}</pre>
          </div>
        );
      }
      return (
        <span key={index} className="block whitespace-pre-wrap leading-relaxed text-slate-300 font-sans text-xs mb-2.5 select-text">
          {part}
        </span>
      );
    });
  };

  const renderDiff = (file: DiffFile) => {
    const before = file.before.split("\n");
    const after = file.after.split("\n");
    const max = Math.max(before.length, after.length);

    return Array.from({ length: Math.min(max, 100) }).map((_, index) => {
      const left = before[index] ?? "";
      const right = after[index] ?? "";
      const changed = left !== right;

      return (
        <div
          key={index}
          className={`grid grid-cols-2 text-[10px] leading-5 font-mono select-none border-b border-white/[0.02]`}
        >
          <div className={`flex items-start px-2 py-0.5 border-r border-white/[0.04] overflow-hidden ${
            changed && left ? "bg-rose-950/15 text-rose-300/90" : "text-slate-500"
          }`}>
            <span className="w-6 shrink-0 opacity-35 text-[9px] text-right pr-2 select-none font-sans">{index + 1}</span>
            <pre className="truncate font-mono">{left}</pre>
          </div>
          <div className={`flex items-start px-2 py-0.5 overflow-hidden ${
            changed && right ? "bg-emerald-950/15 text-emerald-300/90" : "text-slate-400"
          }`}>
            <span className="w-6 shrink-0 opacity-35 text-[9px] text-right pr-2 select-none font-sans">{index + 1}</span>
            <pre className="truncate font-mono">{right}</pre>
          </div>
        </div>
      );
    });
  };

  return (
    <aside className="flex h-full w-[380px] shrink-0 flex-col overflow-hidden border-l border-white/[0.06] bg-[#05080c]">
      <div className="shrink-0 border-b border-white/[0.06] p-4 bg-[#080d14]/40">
        <p className="text-xs font-bold text-white">
          Workspace Tools
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500 font-medium">
          Chat, AST refactoring, snapshots, and diff comparison previews.
        </p>
      </div>

      <div className="grid shrink-0 grid-cols-5 gap-1.5 border-b border-white/[0.06] bg-[#080d14]/40 p-2">
        {[
          ["chat", Bot, "Chat"],
          ["plan", Sparkles, "AI Plan"],
          ["actions", PenLine, "AST Actions"],
          ["snapshots", Camera, "Snapshots"],
          ["diff", FileSearch, "Diff"],
        ].map(([key, Icon, label]) => (
          <button
            key={key as string}
            type="button"
            onClick={() =>
              setActiveTool(key as typeof activeTool)
            }
            title={label as string}
            className={`flex h-8 items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
              activeTool === key
                ? "bg-cyan-400/10 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-cyan-400/20"
                : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-200 border border-transparent"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {activeTool === "chat" && (
          <div className="space-y-4">
            <form onSubmit={ask} className="flex flex-col gap-2">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                placeholder="Ask about this project architecture..."
                className="mb-3 w-full resize-none rounded-xl border border-white/[0.08] bg-[#03060b]/40 px-3 py-2.5 text-xs leading-6 text-slate-250 outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-500/10 placeholder:text-slate-650"
              />
              <button
                type="submit"
                disabled={panelLoading === "chat" || !question.trim()}
                className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 text-xs font-bold text-slate-950 shadow-[0_2px_10px_rgba(34,211,238,0.15)] hover:from-cyan-300 hover:to-cyan-200 transition-all duration-300 disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                {panelLoading === "chat" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Ask server AI
              </button>
            </form>
            {/* Chat history */}
            <div className="max-h-64 overflow-y-auto rounded border border-white/[0.06] bg-[#02050a] p-2">
              {messages.map((msg, idx) => (
                <div key={idx} className={`mb-2 ${msg.role === "assistant" ? "text-cyan-200" : "text-slate-300"}`}>
                  <span className="font-medium">
                    {msg.role === "assistant" ? "AI" : "You"}:
                  </span>
                  <span className="ml-1" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br/>") }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTool === "plan" && (
          <div className="space-y-4">
            {refactorPlan ? (
              <>
                <div className="rounded-2xl border border-cyan-400/15 bg-cyan-950/10 p-4">
                  <p className="mb-2 flex items-center gap-2 text-xs font-bold text-cyan-200 uppercase tracking-wider">
                    <Sparkles className="h-4 w-4" />
                    AI Refactor Plan
                  </p>
                  <p className="text-xs leading-6 text-slate-300">
                    {refactorPlan.plan.summary}
                  </p>
                </div>

                {refactorPlan.plan.actions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Suggested Actions
                    </p>
                    {refactorPlan.plan.actions.map((action, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-3.5 w-3.5 text-amber-300" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200">
                            {action.type.replace(/_/g, " ")}
                          </span>
                        </div>

                        {action.type === "RENAME_FUNCTION" && (
                          <>
                            <p className="text-xs text-slate-400 mb-2">
                              <span className="text-rose-300 font-mono">{action.oldName}</span>
                              {" → "}
                              <span className="text-emerald-300 font-mono">{action.newName}</span>
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setOldName(action.oldName ?? "");
                                setNewName(action.newName ?? "");
                                setActiveTool("actions");
                              }}
                              className="flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-300 text-[11px] font-bold text-slate-950 transition-all duration-300 hover:from-cyan-300 hover:to-cyan-200 active:scale-95 cursor-pointer"
                            >
                              <PenLine className="h-3.5 w-3.5" />
                              Apply Rename
                            </button>
                          </>
                        )}

                        {action.type === "MOVE_FUNCTION" && (
                          <>
                            <p className="text-xs text-slate-400 mb-1">
                              Move <span className="text-cyan-200 font-mono">{action.function}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 mb-2 font-mono">
                              {action.from} → {action.to}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setMoveName(action.function ?? "");
                                setSourceFile(action.from ?? "");
                                setTargetFile(action.to ?? "");
                                setActiveTool("actions");
                              }}
                              className="flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-950/10 text-[11px] font-bold text-cyan-200 hover:bg-cyan-500/10 transition-all duration-300 active:scale-95 cursor-pointer"
                            >
                              <ArrowRightLeft className="h-3.5 w-3.5" />
                              Apply Move
                            </button>
                          </>
                        )}

                        {action.type !== "RENAME_FUNCTION" && action.type !== "MOVE_FUNCTION" && (
                          <p className="text-xs text-slate-400">
                            {JSON.stringify(action, null, 2)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {refactorPlan.changeSet.warnings.length > 0 && (
                  <div className="rounded-xl border border-amber-400/20 bg-amber-950/10 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-2">
                      Warnings
                    </p>
                    {refactorPlan.changeSet.warnings.map((w, i) => (
                      <p key={i} className="text-xs text-amber-200/80 leading-5">{w}</p>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-white/[0.06] bg-[#03060b]/40 p-4 text-center">
                <Sparkles className="mx-auto mb-3 h-8 w-8 text-slate-600" />
                <p className="text-xs text-slate-400 font-medium">
                  No refactor plan yet
                </p>
                <p className="mt-1 text-[10px] text-slate-600">
                  Click &quot;Refactor&quot; on an open file to generate an AI plan.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTool === "actions" && (
          <div className="space-y-5">
        <form
          onSubmit={rename}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
        >
          <p className="mb-3 flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <PenLine className="h-4 w-4 text-cyan-300" />
            Rename Function
          </p>
          <input
            value={oldName}
            onChange={(event) => setOldName(event.target.value)}
            placeholder="oldFunctionName"
            className="mb-2 h-9 w-full rounded-xl border border-white/[0.08] bg-[#03060b]/40 px-3 text-xs text-slate-200 outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-500/10 placeholder:text-slate-650"
          />
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="newFunctionName"
            className="mb-3 h-9 w-full rounded-xl border border-white/[0.08] bg-[#03060b]/40 px-3 text-xs text-slate-200 outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-500/10 placeholder:text-slate-650"
          />
          <button
            type="button"
            onClick={previewRename}
            disabled={panelLoading === "preview" || !oldName || !newName}
            className="mb-2 flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] text-xs font-bold text-slate-300 transition-all hover:bg-white/[0.04] disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {panelLoading === "preview" && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            Preview diff
          </button>
          <button
            type="submit"
            disabled={loading !== null || !oldName || !newName}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 text-xs font-bold text-slate-950 transition-all duration-300 hover:from-cyan-300 hover:to-cyan-200 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {loading === "rename" && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            Rename codebase-wide
          </button>
        </form>

        <form
          onSubmit={move}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
        >
          <p className="mb-3 flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <ArrowRightLeft className="h-4 w-4 text-cyan-300" />
            Move Function
          </p>
          <input
            value={moveName}
            onChange={(event) => setMoveName(event.target.value)}
            placeholder="functionName"
            className="mb-2 h-9 w-full rounded-xl border border-white/[0.08] bg-[#03060b]/40 px-3 text-xs text-slate-200 outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-500/10 placeholder:text-slate-650"
          />
          <input
            value={sourceFile}
            onChange={(event) => setSourceFile(event.target.value)}
            placeholder={activePath ?? "source/file.ts"}
            className="mb-2 h-9 w-full rounded-xl border border-white/[0.08] bg-[#03060b]/40 px-3 text-xs text-slate-200 outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-500/10 placeholder:text-slate-650"
          />
          <input
            value={targetFile}
            onChange={(event) => setTargetFile(event.target.value)}
            placeholder="target/file.ts"
            className="mb-3 h-9 w-full rounded-xl border border-white/[0.08] bg-[#03060b]/40 px-3 text-xs text-slate-200 outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-500/10 placeholder:text-slate-650"
          />
          <button
            type="button"
            onClick={previewMove}
            disabled={
              panelLoading === "preview" ||
              !moveName ||
              !(sourceFile || activePath) ||
              !targetFile
            }
            className="mb-2 flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] text-xs font-bold text-slate-300 transition-all hover:bg-white/[0.04] disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {panelLoading === "preview" && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            Preview diff
          </button>
          <button
            type="submit"
            disabled={
              loading !== null ||
              !moveName ||
              !(sourceFile || activePath) ||
              !targetFile
            }
            className="flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-950/10 text-xs font-bold text-cyan-200 hover:bg-cyan-500/10 transition-all duration-300 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {loading === "move" && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            Move and update imports
          </button>
        </form>

        {message && (
          <p className="rounded-xl border border-white/[0.06] bg-[#03060b]/40 px-3 py-2.5 text-[10px] leading-5 text-slate-400 font-mono">
            {message}
          </p>
        )}
          </div>
        )}

        {activeTool === "snapshots" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={createSnapshot}
              disabled={panelLoading === "snapshot"}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 text-xs font-bold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {panelLoading === "snapshot" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              Snapshot open files
            </button>
            <button
              type="button"
              onClick={loadSnapshots}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] text-xs font-bold text-slate-350 hover:bg-white/[0.03] transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Load snapshots
            </button>
            <div className="space-y-2">
              {snapshots.map((snapshot) => (
                <div
                  key={snapshot._id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 shadow-md"
                >
                  <p className="text-xs font-bold text-slate-200">
                    {snapshot.files.length} file snapshot
                  </p>
                  <p className="mt-1 text-[9px] text-slate-500 font-mono">
                    {snapshot.createdAt
                      ? new Date(snapshot.createdAt).toLocaleString()
                      : snapshot._id}
                  </p>
                  <button
                    type="button"
                    onClick={() => restoreSnapshot(snapshot._id)}
                    disabled={panelLoading === "restore"}
                    className="mt-3 h-8 w-full rounded-lg border border-cyan-400/20 bg-cyan-500/5 text-xs font-bold text-cyan-200 transition hover:bg-cyan-400/10 disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
            {message && (
              <p className="rounded-xl border border-white/[0.06] bg-[#03060b]/40 px-3 py-2.5 text-[10px] leading-5 text-slate-400 font-mono">
                {message}
              </p>
            )}
          </div>
        )}

        {activeTool === "diff" && (
          <div className="space-y-4">
            {diffFiles.length ? (
              diffFiles.map((file) => (
                <div
                  key={file.filePath}
                  className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#03060b]/40 shadow-lg"
                >
                  <div className="border-b border-white/[0.05] bg-white/[0.01] px-3 py-2">
                    <p className="break-all text-[10px] font-mono font-bold text-slate-400">
                      {file.filePath}
                    </p>
                  </div>
                  <div className="max-h-72 overflow-auto scrollbar-none">
                    {/* Updated diff styling for VS Code-like appearance */}
                    {renderDiff(file)}
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-white/[0.06] bg-[#03060b]/40 p-4 text-xs leading-6 text-slate-500 text-center font-medium">
                Preview rename or move to see before/after changes.
              </p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
