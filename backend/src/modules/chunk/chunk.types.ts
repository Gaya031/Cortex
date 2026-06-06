import { FunctionParameter } from "@babel/types";

export enum ChunkType {
  FUNCTION = "FUNCTION",
  COMPONENT = "COMPONENT",
  CLASS = "CLASS",
  METHOD = "METHOD",
  INTERFACE = "INTERFACE",
  TYPE = "TYPE",
}

export enum EmbeddingStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  READY = "READY",
  FAILED = "FAILED",
}

export interface Chunk {
  workspaceId: string;
  filePath: string;
  name: string;
  type: ChunkType;
  content: string;
  startLine: number;
  endLine: number;
  imports: string[];
  exports: string[];
  dependencies: string[];
  resolvedImports: string[];
  calls?: string[];
  calledBy?: string[];
  parameters?: FunctionParameter[];
  returnType?: string;
  parentChunk?: string;
  embeddingStatus: EmbeddingStatus;
}
