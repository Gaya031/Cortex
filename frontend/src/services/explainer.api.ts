import { api } from "@/store/api";

export const explainerApi = {
  async explainProject(workspaceId: string): Promise<string> {
    const res = await api.post("/explainer/project-ai", { workspaceId });
    return (
      res.data.result?.explanation ??
      res.data.result ??
      "No project explanation returned."
    );
  },

  async explainFile(workspaceId: string, filePath: string): Promise<string> {
    const res = await api.post("/explainer/file-ai", {
      workspaceId,
      filePath,
    });
    return (
      res.data.result?.explanation ??
      res.data.result ??
      "No explanation returned."
    );
  },
};
