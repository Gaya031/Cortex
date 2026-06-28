"use client";

import {
  BookMarked,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import WorkspaceSidebar from "@/components/platform/WorkspaceSidebar";
import {
  CreateDecisionPayload,
  Decision,
  decisionApi,
} from "@/services/decision.api";

export default function DecisionsPage({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [tags, setTags] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await decisionApi.list(workspaceId);
      setDecisions(result);
    } catch {
      setError("Could not load decisions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [workspaceId]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !reasoning.trim()) return;

    const payload: CreateDecisionPayload = {
      workspaceId,
      title: title.trim(),
      reasoning: reasoning.trim(),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      importance: 3,
    };

    try {
      setSaving(true);
      setError("");
      const result = await decisionApi.create(payload);
      if (result.conflict) {
        setError(
          `Conflict with existing decision: ${result.conflictingDecision?.title}`,
        );
        return;
      }
      setTitle("");
      setReasoning("");
      setTags("");
      await load();
    } catch {
      setError("Could not save decision.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex h-screen overflow-hidden bg-[#06090d] text-slate-100">
      <section className="min-w-0 flex-1 overflow-auto">
        <header className="border-b border-white/[0.08] bg-[#090d12] px-6 py-5">
          <p className="text-sm font-semibold text-white">
            Decision Memory
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Record architecture and implementation decisions for this workspace
          </p>
        </header>

        <div className="grid gap-6 p-6 lg:grid-cols-[360px_1fr]">
          <form
            onSubmit={submit}
            className="rounded-2xl border border-white/[0.06] bg-[#090e15]/60 p-5"
          >
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
              <Plus className="h-4 w-4" />
              New Decision
            </p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Decision title"
              className="mb-3 h-10 w-full rounded-xl border border-white/[0.08] bg-[#03060b]/40 px-3 text-xs text-slate-200 outline-none focus:border-cyan-400/40"
            />
            <textarea
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              rows={5}
              placeholder="Why was this decision made?"
              className="mb-3 w-full resize-none rounded-xl border border-white/[0.08] bg-[#03060b]/40 px-3 py-2.5 text-xs leading-6 text-slate-200 outline-none focus:border-cyan-400/40"
            />
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (comma separated)"
              className="mb-4 h-10 w-full rounded-xl border border-white/[0.08] bg-[#03060b]/40 px-3 text-xs text-slate-200 outline-none focus:border-cyan-400/40"
            />
            <button
              type="submit"
              disabled={saving || !title.trim() || !reasoning.trim()}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 text-xs font-bold text-slate-950 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BookMarked className="h-4 w-4" />
              )}
              Save Decision
            </button>
            {error && (
              <p className="mt-3 text-xs text-amber-200">{error}</p>
            )}
          </form>

          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading decisions
              </div>
            ) : decisions.length ? (
              decisions.map((decision) => (
                <article
                  key={decision._id}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5"
                >
                  <h3 className="text-sm font-bold text-white">
                    {decision.title}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-slate-400 whitespace-pre-wrap">
                    {decision.reasoning}
                  </p>
                  {decision.tags?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {decision.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-cyan-400/20 bg-cyan-950/20 px-2 py-0.5 text-[10px] text-cyan-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center text-sm text-slate-500">
                <Trash2 className="mx-auto mb-3 h-6 w-6 opacity-40" />
                No decisions recorded yet.
              </div>
            )}
          </div>
        </div>
      </section>
      <WorkspaceSidebar workspaceId={workspaceId} />
    </main>
  );
}
