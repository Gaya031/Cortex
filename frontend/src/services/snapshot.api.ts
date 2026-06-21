import { api } from "@/store/api";

export interface SnapshotFile {
  filePath: string;
  content: string;
}

export interface WorkspaceSnapshot {
  _id: string;
  workspaceId: string;
  files: SnapshotFile[];
  createdAt?: string;
  updatedAt?: string;
}

export const snapshotApi = {
  async create(
    workspaceId: string,
    filePaths: string[],
  ): Promise<WorkspaceSnapshot> {
    const res = await api.post("/snapshot/create", {
      workspaceId,
      filePaths,
    });
    return res.data.result;
  },

  async list(workspaceId: string): Promise<WorkspaceSnapshot[]> {
    const res = await api.get(`/snapshot/workspace/${workspaceId}`);
    return res.data.result ?? [];
  },

  async restore(snapshotId: string): Promise<{
    restored: number;
  }> {
    const res = await api.post(`/snapshot/restore/${snapshotId}`);
    return res.data.result;
  },
};
