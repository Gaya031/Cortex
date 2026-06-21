import { api } from "@/store/api";
import { AssistantResponse } from "@/types/assistant.types";

export const assistantApi = {
  async askRepository(
    workspaceId: string,
    question: string,
  ): Promise<AssistantResponse> {
    const res = await api.post("/ai/repository-question", {
      workspaceId,
      question,
    });

    return {
      answer: res.data.result?.answer ?? String(res.data.result ?? ""),
      sources: res.data.result?.sources ?? [],
      mode: res.data.result?.mode ?? "RAG",
    };
  },
};
