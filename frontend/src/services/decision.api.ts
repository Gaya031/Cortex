import { api } from "@/store/api";

export interface Decision {
  _id: string;
  workspaceId: string;
  title: string;
  reasoning: string;
  importance?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDecisionPayload {
  workspaceId: string;
  title: string;
  reasoning: string;
  importance?: number;
  tags?: string[];
}

export const decisionApi = {
  async list(workspaceId: string): Promise<Decision[]> {
    const res = await api.get(`/decision/${workspaceId}`);
    return res.data.result ?? [];
  },

  async create(payload: CreateDecisionPayload) {
    const res = await api.post("/decision", payload);
    return res.data.result;
  },
};
