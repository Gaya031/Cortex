import { api } from "@/store/api";
import { RefactorPlanResult } from "@/store/useEditorStore";

export interface ExecutePlanResult {
  review?: {
    validation: { valid: boolean; errors: string[] };
    risks: Array<{ riskLevel: string; message?: string }>;
  };
  blocked?: boolean;
  reason?: string;
  operations?: unknown[];
  reindex?: unknown;
  snapshotId?: string;
}

export const changesetApi = {
  async executePlan(
    workspaceId: string,
    changeSet: RefactorPlanResult["changeSet"],
  ): Promise<ExecutePlanResult> {
    const res = await api.post("/changeset-executor/execute", {
      workspaceId,
      changeSet,
    });
    return res.data.result;
  },
};
