export type AssistantAction =
  | "explain"
  | "refactor"
  | "optimize"
  | "bugs"
  | "docs"
  | "custom";

export interface AssistantSource {
  filePath: string;
  score?: number;
}

export interface AssistantResponse {
  answer: string;
  sources: AssistantSource[];
  mode: "RAG" | "FLOW" | string;
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: AssistantAction;
  sources?: AssistantSource[];
  mode?: string;
}
