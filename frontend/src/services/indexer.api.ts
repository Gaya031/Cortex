import { api } from "@/store/api";

export interface IndexStats {
  status: string;
  sourceType: string;
  filesIndexed: number;
  chunksTotal: number;
  embeddableChunks: number;
  embeddingsReady: number;
  embeddingCoverage: number;
}

export const indexerApi = {
  async reindex(workspaceId: string): Promise<string> {
    const res = await api.post(`/indexer/${workspaceId}`);
    return (
      res.data.message ??
      "Reindexing started in background."
    );
  },

  async getStats(workspaceId: string): Promise<IndexStats> {
    const res = await api.get(`/indexer/stats/${workspaceId}`);
    return res.data.result;
  },
};
