"use client";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import WorkspaceSidebar from "@/components/platform/WorkspaceSidebar";
import {
  HealthScore,
  AIReview,
  intelligenceApi,
  RepositoryReport,
  RiskItem,
} from "@/services/intelligence.api";

function riskTone(level?: string) {
  if (level === "HIGH") {
    return "border-rose-300/20 text-rose-100 bg-rose-300/8";
  }

  if (level === "MEDIUM") {
    return "border-amber-300/20 text-amber-100 bg-amber-300/8";
  }

  return "border-emerald-300/20 text-emerald-100 bg-emerald-300/8";
}

export default function InsightsDashboard({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [health, setHealth] = useState<HealthScore | null>(null);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [report, setReport] = useState<RepositoryReport | null>(null);
  const [aiReview, setAiReview] = useState<AIReview | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      intelligenceApi.getHealth(workspaceId),
      intelligenceApi.getRisks(workspaceId),
      intelligenceApi.getReport(workspaceId),
    ])
      .then(([healthResult, riskResult, reportResult]) => {
        if (cancelled) return;

        if (healthResult.status === "fulfilled") {
          setHealth(healthResult.value);
        }

        if (riskResult.status === "fulfilled") {
          setRisks(riskResult.value);
        }

        if (reportResult.status === "fulfilled") {
          setReport(reportResult.value);
        }

        if (
          healthResult.status === "rejected" &&
          riskResult.status === "rejected" &&
          reportResult.status === "rejected"
        ) {
          setError(
            "Could not load intelligence data. Sign in or index the workspace.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const summary = useMemo(
    () => health?.summary ?? report?.architecture?.metrics ?? {},
    [health, report],
  );

  return (
    <main className="flex h-screen overflow-hidden bg-[#06090d] text-slate-100">
      <section className="min-w-0 flex-1 overflow-auto">
        <header className="border-b border-white/[0.08] bg-[#090d12] px-6 py-5">
          <p className="text-sm font-semibold text-white">
            Architecture Insights
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Health, risk, coupling, and repository recommendations
          </p>
        </header>

        {error && (
          <div className="m-6 flex items-center gap-2 rounded-lg border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex h-[calc(100vh-80px)] items-center justify-center text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading intelligence
          </div>
        ) : (
          <div className="space-y-6 p-6">
            <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
              <div className="rounded-2xl border border-white/[0.06] bg-[#090e15]/60 p-5 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 h-20 w-20 bg-cyan-500/5 rounded-full blur-2xl animate-pulse" />
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      Health Score
                    </p>
                    <p className="mt-2 text-lg font-bold text-white leading-normal">
                      {health?.status ?? "Unavailable"}
                    </p>
                  </div>
                  <div className="relative flex h-20 w-20 items-center justify-center shrink-0">
                    <svg className="absolute -rotate-90 h-20 w-20">
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        className="stroke-white/[0.03]"
                        strokeWidth="5.5"
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        className="stroke-cyan-400 transition-all duration-1000 ease-out"
                        strokeWidth="5.5"
                        strokeDasharray="201"
                        strokeDashoffset={201 - (201 * (health?.score ?? 0)) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <span className="text-xl font-black text-cyan-200 tracking-tight">
                      {health?.score ?? "--"}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {health?.recommendation ??
                    "Run indexing and sign in to unlock repository intelligence."}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(summary)
                  .slice(0, 6)
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 hover:bg-white/[0.03] hover:border-cyan-500/25 transition-all duration-300 shadow-md group"
                    >
                      <p className="text-2xl font-black text-white group-hover:text-cyan-200 transition">
                        {value}
                      </p>
                      <p className="mt-2 text-[9px] uppercase tracking-[0.14em] text-slate-500 font-bold">
                        {key.replace(/([A-Z])/g, " $1")}
                      </p>
                    </div>
                  ))}
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/[0.06] bg-[#090e15]/60 backdrop-blur-md">
                <div className="border-b border-white/[0.06] px-5 py-4">
                  <p className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <ShieldAlert className="h-4 w-4 text-cyan-300" />
                    Top Risks
                  </p>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {(risks.length ? risks : report?.topRisks ?? [])
                    .slice(0, 8)
                    .map((risk) => (
                      <div
                        key={risk.file}
                        className="grid gap-3 px-5 py-4 hover:bg-white/[0.015] transition-all duration-150 md:grid-cols-[1fr_auto] md:items-center"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-mono font-bold text-slate-200">
                            {risk.file}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-500 font-medium">
                            impact {risk.impactScore ?? 0} · coupling{" "}
                            {risk.couplingScore ?? 0}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold tracking-wider shrink-0 ${riskTone(
                            risk.riskLevel,
                          )}`}
                        >
                          {risk.riskLevel} · {risk.riskScore}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-[#090e15]/60 backdrop-blur-md">
                <div className="border-b border-white/[0.06] px-5 py-4">
                  <p className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <Sparkles className="h-4 w-4 text-cyan-300" />
                    Recommended Actions
                  </p>
                </div>
                <div className="space-y-2.5 p-5">
                  {(
                    report?.recommendationActions ??
                    health?.issues ??
                    []
                  )
                    .slice(0, 10)
                    .map((item) => (
                      <div
                        key={item}
                        className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5 hover:border-cyan-400/20 transition-all"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                        <p className="text-xs leading-relaxed text-slate-350">
                          {item}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.06] bg-[#090e15]/60 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <p className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                  AI Architecture Review
                </p>
                <button
                  type="button"
                  disabled={reviewLoading}
                  onClick={async () => {
                    try {
                      setReviewLoading(true);
                      const review = await intelligenceApi.getReview(workspaceId);
                      setAiReview(review);
                    } catch {
                      setAiReview({ raw: "Could not generate AI review." });
                    } finally {
                      setReviewLoading(false);
                    }
                  }}
                  className="rounded-lg border border-cyan-400/25 bg-cyan-950/20 px-3 py-1.5 text-[10px] font-bold text-cyan-200 disabled:opacity-50"
                >
                  {reviewLoading ? "Generating…" : "Generate review"}
                </button>
              </div>
              <div className="space-y-3 p-5 text-xs leading-relaxed text-slate-300">
                {aiReview ? (
                  <>
                    {aiReview.summary && (
                      <p className="whitespace-pre-wrap">{aiReview.summary}</p>
                    )}
                    {aiReview.strengths?.map((item) => (
                      <p key={item} className="text-emerald-300">
                        + {item}
                      </p>
                    ))}
                    {aiReview.weaknesses?.map((item) => (
                      <p key={item} className="text-amber-200">
                        − {item}
                      </p>
                    ))}
                    {aiReview.recommendations?.map((item) => (
                      <p key={item} className="text-cyan-200">
                        → {item}
                      </p>
                    ))}
                    {aiReview.raw && !aiReview.summary && (
                      <p className="whitespace-pre-wrap font-mono text-[11px] text-slate-400">
                        {aiReview.raw}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-slate-500">
                    Run an AI review for narrative feedback on architecture health.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}
      </section>
      <WorkspaceSidebar workspaceId={workspaceId} />
    </main>
  );
}
