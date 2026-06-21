import { api } from "@/store/api";

export const indexerApi = {
  async reindex(workspaceId: string): Promise<string> {
    const res = await api.post(`/indexer/${workspaceId}`);
    return (
      res.data.message ??
      "Reindexing started in background."
    );
  },
};
