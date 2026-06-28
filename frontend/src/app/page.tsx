"use client";

import {
  ArrowRight,
  BrainCircuit,
  FolderKanban,
  GitBranch,
  Loader2,
  LockKeyhole,
  FolderOpen,
  Plus,
  Radar,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { workspaceApi } from "@/services/workspace.api";
import { Workspace } from "@/types/workspace.types";

type AuthMode = "login" | "register";
type WorkspaceSourceMode = "github" | "local";

export default function DashboardPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [sourceMode, setSourceMode] = useState<WorkspaceSourceMode>("github");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspacePath, setWorkspacePath] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [githubBranch, setGithubBranch] = useState("main");
  const [githubToken, setGithubToken] = useState("");
  const [message, setMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("ai_code_editor_token");
    if (token) setIsAuthenticated(true);
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      setMessage("");
      const result = await workspaceApi.getAll();
      setWorkspaces(result);
    } catch {
      setWorkspaces([]);
      setMessage("Sign in to load your indexed workspaces.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    workspaceApi
      .getAll()
      .then((result) => {
        if (cancelled) return;
        setWorkspaces(result);
        setMessage("");
      })
      .catch(() => {
        if (cancelled) return;
        setWorkspaces([]);
        setMessage("Sign in to load your indexed workspaces.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const statusCounts = useMemo(() => {
    return workspaces.reduce<Record<string, number>>(
      (acc, workspace) => {
        const status = workspace.status ?? "READY";
        acc[status] = (acc[status] ?? 0) + 1;
        return acc;
      },
      {},
    );
  }, [workspaces]);

  const handleAuth = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      setMessage("");
      const result =
        authMode === "login"
          ? await workspaceApi.login(email, password)
          : await workspaceApi.register(name, email, password);

      window.localStorage.setItem(
        "ai_code_editor_token",
        result.token,
      );
      setIsAuthenticated(true);
      setMessage(`Signed in as ${result.user.email}.`);
      await loadWorkspaces();
    } catch {
      setMessage("Authentication failed. Check credentials.");
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    window.localStorage.removeItem("ai_code_editor_token");
    setIsAuthenticated(false);
    setWorkspaces([]);
    setMessage("Signed out.");
  };

  const handleCreateWorkspace = async (event: FormEvent) => {
    event.preventDefault();
    if (!workspaceName) {
      setMessage("Workspace name is required.");
      return;
    }

    if (sourceMode === "github" && !githubUrl) {
      setMessage("GitHub repository URL is required.");
      return;
    }

    if (sourceMode === "local" && !workspacePath) {
      setMessage("Local path is required for local workspaces.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      await workspaceApi.create(
        sourceMode === "github"
          ? {
              name: workspaceName,
              sourceType: "github",
              githubUrl,
              githubBranch: githubBranch || "main",
              githubToken: githubToken || undefined,
            }
          : {
              name: workspaceName,
              sourceType: "local",
              localPath: workspacePath,
            },
      );
      setWorkspaceName("");
      setWorkspacePath("");
      setGithubUrl("");
      setGithubBranch("main");
      setGithubToken("");
      await loadWorkspaces();
      setMessage("Workspace created. Indexing started in the background.");
    } catch {
      setMessage(
        "Could not create workspace. Make sure you are signed in and the repo is accessible.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this workspace? This will permanently remove all indexed files, function scopes, and dependencies.",
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      await workspaceApi.delete(workspaceId);
      await loadWorkspaces();
      setMessage("Workspace deleted successfully.");
    } catch {
      setMessage("Could not delete workspace.");
    } finally {
      setLoading(false);
    }
  };

  const handleBrowseFolder = async () => {
    try {
      setMessage("");
      const result = await workspaceApi.browseFolder();
      if (!result.canceled && result.path) {
        setWorkspacePath(result.path);
        // Automatically default workspace name to folder name if empty
        if (!workspaceName) {
          const parts = result.path.split(/[/\\]/);
          const lastPart =
            parts[parts.length - 1] || parts[parts.length - 2] || "";
          if (lastPart) {
            setWorkspaceName(lastPart);
          }
        }
      }
    } catch (err) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setMessage(
        axiosError.response?.data?.message || "Could not open system folder picker.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#03070c] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      <section className="relative overflow-hidden border-b border-white/[0.06] bg-[radial-gradient(circle_at_30%_-20%,rgba(34,211,238,0.18),transparent_45%),linear-gradient(180deg,#090f17_0%,#03070c_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
        <div className="relative mx-auto flex min-h-[420px] max-w-7xl flex-col justify-between px-6 py-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 text-white shadow-[0_0_30px_rgba(103,232,249,0.22)]">
                <BrainCircuit className="h-5.5 w-5.5" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-wide text-white">
                  Cortex
                </p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Neural Intelligence for Code
                </p>
              </div>
            </div>
            <div className="hidden items-center gap-5 text-xs text-slate-400 md:flex">
              <span>Monaco</span>
              <span>React Flow</span>
              <span>Dagre</span>
              <span>Architecture AI</span>
            </div>
          </nav>

          <div className="grid gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
                System-aware development
              </p>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent md:text-7xl">
                Build with the whole codebase in view.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400">
                Open files, inspect architecture, trace calls, and ask the
                AI about the engineering decisions behind the project.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 border-y border-white/[0.08] py-4 lg:border-y-0 lg:border-l lg:pl-6">
              {[
                {
                  label: "Workspaces",
                  value: workspaces.length,
                  icon: FolderKanban,
                },
                {
                  label: "Ready",
                  value: statusCounts.READY ?? 0,
                  icon: ShieldCheck,
                },
                {
                  label: "Indexed",
                  value:
                    workspaces.length -
                    (statusCounts.FAILED ?? 0),
                  icon: Radar,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label}>
                    <Icon className="mb-3 h-4 w-4 text-cyan-300" />
                    <p className="text-3xl font-semibold text-white">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Workspaces
              </h2>
              <p className="text-sm text-slate-500">
                Open an indexed project or connect a GitHub repository.
              </p>
            </div>
            {loading && (
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            )}
          </div>

          {message && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
              <LockKeyhole className="h-4 w-4" />
              {message}
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.015]">
            {workspaces.length ? (
              <div className="space-y-3">
                {workspaces.map((workspace) => {
                  const id = workspace._id ?? workspace.id;
                  const status = workspace.status ?? "READY";
                  const isReady = status === "READY";
                  const isIndexing = status === "PROCESSING" || status === "CREATED";
                  return (
                    <Link
                      key={id}
                      href={`/workspace/${id}`}
                      className="group block rounded-xl border border-white/[0.06] bg-white/[0.015] px-6 py-5 transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/[0.035] hover:shadow-[0_12px_30px_rgba(0,0,0,0.35),0_0_1px_rgba(34,211,238,0.15)] hover:-translate-y-[1px]"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950/40 text-cyan-400 border border-cyan-800/30">
                              <GitBranch className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="truncate text-sm font-semibold text-white group-hover:text-cyan-200 transition">
                                  {workspace.name}
                                </h3>
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                  isReady 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                    : isIndexing
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                }`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${
                                    isReady ? "bg-emerald-400" : isIndexing ? "bg-amber-400 animate-pulse" : "bg-rose-400"
                                  }`} />
                                  {status}
                                </span>
                              </div>
                              <p className="mt-1 truncate text-xs text-slate-500 font-mono">
                                {workspace.sourceType === "github"
                                  ? `${workspace.githubOwner}/${workspace.githubRepo}`
                                  : workspace.localPath}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4 shrink-0 md:justify-end">
                          <div className="text-left md:text-right">
                            <p className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold">
                              Last Indexed
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {workspace.updatedAt
                                ? new Date(workspace.updatedAt).toLocaleDateString()
                                : "No date"}
                            </p>
                          </div>
                          
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteWorkspace(id);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.03] text-slate-500 transition hover:bg-rose-500/20 hover:text-rose-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.35)] border border-white/[0.04] hover:border-rose-500/30"
                            title="Delete Workspace"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.03] text-slate-500 transition group-hover:bg-cyan-400 group-hover:text-slate-950 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-12 text-center">
                <FolderKanban className="mx-auto mb-4 h-10 w-10 text-slate-700" />
                <p className="text-sm font-medium text-slate-300">
                  No workspaces loaded
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Sign in, then connect a GitHub repository.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-5">
          {isAuthenticated ? (
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-950/10 p-5 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 h-20 w-20 bg-emerald-500/10 rounded-full blur-2xl" />
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Access Active
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-normal">
                    Signed in. Workspace APIs will authenticate automatically.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs font-bold text-slate-200 transition-all duration-200 hover:bg-white/[0.06] hover:text-white active:scale-95"
              >
                Sign out
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleAuth}
              className="rounded-2xl border border-white/[0.06] bg-[#090e15]/60 p-5 backdrop-blur-md"
            >
              <div className="mb-4">
                <h3 className="text-sm font-bold text-white">
                  Access Key
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Authentication token is stored securely in local storage.
                </p>
              </div>

              <div className="mb-3 grid grid-cols-2 rounded-xl bg-white/[0.02] border border-white/[0.06] p-1 text-[11px] font-bold uppercase tracking-wider">
                {(["login", "register"] as AuthMode[]).map(
                  (mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setAuthMode(mode)}
                      className={`rounded-lg py-2 transition-all ${
                        authMode === mode
                          ? "bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 shadow-[0_4px_12px_rgba(34,211,238,0.2)]"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {mode}
                    </button>
                  ),
                )}
              </div>

              {authMode === "register" && (
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Full name"
                  className="mb-2 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 text-xs outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20"
                />
              )}
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                className="mb-2 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 text-xs outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20"
              />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                type="password"
                className="mb-3 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 text-xs outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20"
              />
              <button
                type="submit"
                disabled={saving}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 text-xs font-bold text-slate-950 shadow-[0_4px_12px_rgba(34,211,238,0.15)] hover:from-cyan-300 hover:to-cyan-200 transition-all duration-300 disabled:opacity-50 active:scale-95"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Continue
              </button>
            </form>
          )}

          <form
            onSubmit={handleCreateWorkspace}
            className="rounded-2xl border border-white/[0.06] bg-[#090e15]/60 p-5 backdrop-blur-md"
          >
            <div className="mb-4">
              <h3 className="text-sm font-bold text-white">
                New Workspace
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Index a GitHub repository for cloud deployment.
              </p>
            </div>

            <div className="mb-3 grid grid-cols-2 rounded-xl bg-white/[0.02] border border-white/[0.06] p-1 text-[11px] font-bold uppercase tracking-wider">
              {(["github", "local"] as WorkspaceSourceMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSourceMode(mode)}
                  className={`rounded-lg py-2 transition-all ${
                    sourceMode === mode
                      ? "bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <input
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              placeholder="Workspace name (e.g. My API)"
              className="mb-2 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 text-xs outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20"
            />

            {sourceMode === "github" ? (
              <>
                <input
                  value={githubUrl}
                  onChange={(event) => setGithubUrl(event.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="mb-2 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 text-xs outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20"
                />
                <input
                  value={githubBranch}
                  onChange={(event) => setGithubBranch(event.target.value)}
                  placeholder="Branch (default: main)"
                  className="mb-2 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 text-xs outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20"
                />
                <input
                  value={githubToken}
                  onChange={(event) => setGithubToken(event.target.value)}
                  placeholder="GitHub token (optional for public repos)"
                  type="password"
                  className="mb-3 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 text-xs outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20"
                />
              </>
            ) : (
              <div className="relative mb-3 flex gap-2">
                <input
                  value={workspacePath}
                  onChange={(event) => setWorkspacePath(event.target.value)}
                  placeholder="/absolute/path/to/local/project"
                  className="h-10 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 text-xs outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20"
                />
                <button
                  type="button"
                  onClick={handleBrowseFolder}
                  className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-bold text-slate-300 transition hover:bg-white/[0.08] hover:text-white active:scale-95"
                >
                  <FolderOpen className="h-4 w-4" />
                  Browse
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-950/10 text-xs font-bold text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.02)] hover:bg-cyan-500/10 transition-all duration-300 disabled:opacity-50 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Create and index
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}
