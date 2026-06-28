import { EmbeddingStatus } from "../embedding/embedding.types.js";

export enum ChunkType {
  FUNCTION = "FUNCTION",
  COMPONENT = "COMPONENT",
  CLASS = "CLASS",
  METHOD = "METHOD",
  INTERFACE = "INTERFACE",
  TYPE = "TYPE",
  MODULE = "MODULE",
}

export interface ImportBinding {
  localName: string;
  importedName: string;
  modulePath: string;
  resolvedFilePath?: string;
}

export interface ChunkParameter {
  name: string;
  type: string;
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
  importBindings?: ImportBinding[];
  calls?: string[];
  calledBy?: string[];
  parameters?: ChunkParameter[];
  returnType?: string;
  parentChunk?: string;
  embeddingStatus: EmbeddingStatus;
}
