import { api } from "@/store/api";

export interface HealthScore {
  score: number;
  grade: string;
  status: string;
  strengths?: string[];
  issues?: string[];
  recommendation?: string;
  summary?: Record<string, number>;
}

export interface RiskItem {
  file: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  importCount?: number;
  couplingScore?: number;
  impactScore?: number;
  circularDependencyCount?: number;
}

export interface RepositoryReport {
  health?: HealthScore;
  topRisks?: RiskItem[];
  recommendationActions?: string[];
  architecture?: {
    metrics?: Record<string, number>;
  };
}

export const intelligenceApi = {
  async getHealth(workspaceId: string): Promise<HealthScore> {
    const res = await api.get(
      `/intelligence/health/${workspaceId}`,
    );
    return res.data.result;
  },

  async getRisks(workspaceId: string): Promise<RiskItem[]> {
    const res = await api.get(
      `/intelligence/risk/${workspaceId}`,
    );
    return res.data.result ?? [];
  },

  async getReport(
    workspaceId: string,
  ): Promise<RepositoryReport> {
    const res = await api.get(
      `/intelligence/report/${workspaceId}`,
    );
    return res.data.result;
  },
};
