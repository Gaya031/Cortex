export enum EmbeddingStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  READY = "READY",
  FAILED = "FAILED",
}

export interface Embedding {
  workspaceId: string;
  chunkId: string;
  filePath: string;
  contentHash: string;
  embedding: number[];
  status: EmbeddingStatus;
}

export interface SearchResult {
  chunkId: string;
  filePath: string;
  content: string;
  score: number;
}
