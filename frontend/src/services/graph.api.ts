import { api } from "@/store/api";

export const graphApi = {
  async getDependencies(
    workspaceId: string,
    filePath: string,
  ): Promise<string[]> {
    const res = await api.get("/graph/dependencies", {
      params: { workspaceId, filePath },
    });
    return res.data.dependencies ?? [];
  },

  async getDependents(
    workspaceId: string,
    filePath: string,
  ): Promise<string[]> {
    const res = await api.get("/graph/dependents", {
      params: { workspaceId, filePath },
    });
    return res.data.dependents ?? [];
  },
};
