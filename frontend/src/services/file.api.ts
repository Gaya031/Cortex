import { api } from "@/store/api";
import { ProjectFile } from "@/types/file.types";

export const fileApi = {
  async getWorkspaceFiles(
    workspaceId: string,
  ): Promise<ProjectFile[]> {
    const res = await api.get(
      `/file/workspaces/${workspaceId}`,
    );
    return res.data.data ?? [];
  },

  async getFileContent(
    workspaceId: string,
    filePath: string,
  ): Promise<string> {
    const res = await api.get("/file/content", {
      params: {
        workspaceId,
        filePath,
      },
    });
    return res.data.data?.content ?? "";
  },

  async saveFileContent(
    workspaceId: string,
    filePath: string,
    content: string,
  ): Promise<void> {
    await api.post("/file/save", {
      workspaceId,
      filePath,
      content,
    });
  },

  async explainFile(
    workspaceId: string,
    filePath: string,
  ): Promise<string> {
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

  async generateRefactorPlan(
    workspaceId: string,
    goal: string,
  ): Promise<{
    plan: { summary: string; actions: Array<{ type: string; oldName?: string; newName?: string; function?: string; from?: string; to?: string }> };
    changeSet: {
      createFiles: string[];
      moveFunctions: Array<{ function: string; from: string; to: string }>;
      renameFunctions: Array<{ oldName: string; newName: string }>;
      updateImports: Array<{ file: string; reason: string }>;
      warnings: string[];
    };
  }> {
    const res = await api.post("/refactor-plan/generate", {
      workspaceId,
      goal,
    });
    return res.data.result;
  },
};
