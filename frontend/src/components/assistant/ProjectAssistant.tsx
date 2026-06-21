"use client";

import {
  Bot,
  Bug,
  FileText,
  Loader2,
  Send,
  Sparkles,
  Wand2,
  Wrench,
  Zap,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import WorkspaceSidebar from "@/components/platform/WorkspaceSidebar";
import { assistantApi } from "@/services/assistant.api";
import {
  AssistantAction,
  AssistantMessage,
} from "@/types/assistant.types";

const actions: {
  id: AssistantAction;
  label: string;
  icon: typeof Sparkles;
  prompt: string;
}[] = [
  {
    id: "explain",
    label: "Explain",
    icon: Bot,
    prompt:
      "Explain this project architecture, main modules, data flow, and important entry points.",
  },
  {
    id: "refactor",
    label: "Refactor",
    icon: Wrench,
    prompt:
      "Suggest a safe refactor plan for this project. Include risks, affected files, and step-by-step changes.",
  },
  {
    id: "optimize",
    label: "Optimize",
    icon: Zap,
    prompt:
      "Find optimization opportunities in this project. Focus on performance, coupling, repeated logic, and maintainability.",
  },
  {
    id: "bugs",
    label: "Find Bugs",
    icon: Bug,
    prompt:
      "Review this project for likely bugs and risky code paths. Explain evidence from files and functions.",
  },
  {
    id: "docs",
    label: "Docs",
    icon: FileText,
    prompt:
      "Generate concise architecture documentation for this project using the indexed repository context.",
  },
];

function messageId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ProjectAssistant({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Ask about architecture, flows, refactors, bugs, docs, or implementation decisions. Answers are generated through your server's repository context pipeline.",
      mode: "SERVER_CONTEXT",
    },
  ]);

  const lastSources = useMemo(() => {
    return [...messages]
      .reverse()
      .find((message) => message.sources?.length)?.sources;
  }, [messages]);

  const ask = async (
    question: string,
    action: AssistantAction = "custom",
  ) => {
    if (!question.trim() || loading) {
      return;
    }

    const userMessage: AssistantMessage = {
      id: messageId(),
      role: "user",
      content: question,
      action,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await assistantApi.askRepository(
        workspaceId,
        question,
      );

      setMessages((current) => [
        ...current,
        {
          id: messageId(),
          role: "assistant",
          content: response.answer,
          sources: response.sources,
          mode: response.mode,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not get an AI response from the server.",
      );
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    ask(input);
  };

  const renderMessageContent = (text: string) => {
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
            <pre className="p-3 overflow-x-auto text-cyan-200/90 select-text">{code}</pre>
          </div>
        );
      }
      return (
        <span key={index} className="block whitespace-pre-wrap leading-relaxed text-slate-300 font-sans text-xs mb-2 select-text">
          {part}
        </span>
      );
    });
  };

  return (
    <main className="flex h-dvh overflow-hidden bg-[#03060a] text-slate-100 font-sans">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#080d14]/80 px-5">
          <div>
            <p className="text-sm font-bold text-white">
              Project AI Assistant
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Server-mediated RAG codebase context pipeline
            </p>
          </div>
          <div className="rounded-full border border-cyan-400/25 bg-cyan-950/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-200">
            Secure Context
          </div>
        </header>

        <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
            <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-white/[0.06] bg-[#070b12]/60 px-4 py-3 scrollbar-none">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => ask(action.prompt, action.id)}
                    disabled={loading}
                    className="flex h-8.5 items-center gap-2 rounded-xl border border-white/[0.08] bg-[#090d15]/50 px-3 text-xs font-bold text-slate-400 transition-all hover:border-cyan-300/35 hover:text-cyan-200 disabled:opacity-50 cursor-pointer active:scale-95 shrink-0"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {action.label}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="shrink-0 border-b border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs text-amber-100">
                {error}
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 scrollbar-none">
              <div className="mx-auto max-w-4xl space-y-5">
                {messages.map((message) => {
                  const isUser = message.role === "user";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] overflow-hidden rounded-2xl px-5 py-4 shadow-lg ${
                          isUser
                            ? "bg-gradient-to-tr from-indigo-650 to-cyan-600 text-white border-0 shadow-[0_4px_16px_rgba(79,70,229,0.18)]"
                            : "border border-white/[0.06] bg-white/[0.015] text-slate-200"
                        }`}
                      >
                        <div className="whitespace-pre-wrap break-words text-xs leading-relaxed">
                          {isUser ? message.content : renderMessageContent(message.content)}
                        </div>
                        {message.mode && !isUser && (
                          <p className="mt-3.5 text-[8px] font-bold uppercase tracking-[0.14em] text-slate-500">
                            {message.mode}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Server is building project context...
                  </div>
                )}
              </div>
            </div>

            <form
              onSubmit={submit}
              className="shrink-0 border-t border-white/[0.06] bg-[#080c13] p-4"
            >
              <div className="mx-auto flex max-w-4xl items-end gap-3">
                <textarea
                  value={input}
                  onChange={(event) =>
                    setInput(event.target.value)
                  }
                  placeholder="Ask about authentication, refactors, or bugs..."
                  rows={2}
                  className="max-h-40 min-h-11 min-w-0 flex-1 resize-none rounded-xl border border-white/[0.08] bg-[#03060b]/40 px-4 py-3 text-xs leading-5 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-500/10"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 shadow-[0_2px_10px_rgba(34,211,238,0.2)] hover:from-cyan-300 hover:to-cyan-200 transition-all duration-300 disabled:opacity-50 cursor-pointer active:scale-95 shrink-0"
                >
                  {loading ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <Send className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </form>
          </div>

          <aside className="hidden min-h-0 overflow-y-auto border-l border-white/[0.06] bg-[#05080c] xl:block">
            <div className="border-b border-white/[0.06] p-5 bg-[#080d14]/40">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 border border-cyan-400/25">
                <Wand2 className="h-5 w-5 animate-pulse" />
              </div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Context Routing
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 font-medium">
                Flow-like queries inspect node flow pathways. Semantic Q&A queries match chunk embeddings in vector retrieval.
              </p>
            </div>

            <div className="p-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Latest Sources
              </p>
              <div className="space-y-2">
                {lastSources?.length ? (
                  lastSources.slice(0, 12).map((source) => (
                    <div
                      key={`${source.filePath}-${source.score ?? ""}`}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 shadow-md hover:border-cyan-500/20 transition-all"
                    >
                      <p className="break-all text-[10.5px] font-mono leading-relaxed text-slate-350 select-text">
                        {source.filePath}
                      </p>
                      {source.score !== undefined && (
                        <p className="mt-1 text-[9px] font-bold font-mono text-slate-650">
                          score {source.score.toFixed(3)}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs leading-relaxed text-slate-500">
                    References will load after the first repository query.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
      <WorkspaceSidebar workspaceId={workspaceId} />
    </main>
  );
}
