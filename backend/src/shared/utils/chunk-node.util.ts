import { Chunk, ChunkType } from "../../modules/chunk/chunk.types.js";

import { normalizeFilePath } from "../../shared/utils/path.util.js";

export function getChunkQualifiedName(
  chunk: Pick<Chunk, "name" | "type" | "parentChunk">,
): string {
  if (chunk.type === ChunkType.METHOD && chunk.parentChunk) {
    return `${chunk.parentChunk}.${chunk.name}`;
  }
  return chunk.name;
}

export function buildChunkNodeId(
  chunk: Pick<Chunk, "filePath" | "type" | "name" | "parentChunk">,
): string {
  return `${normalizeFilePath(chunk.filePath)}:${chunk.type}:${getChunkQualifiedName(chunk)}`;
}

/** Resolve legacy `filePath:name` IDs to canonical graph node IDs. */
export function resolveFunctionNodeId(
  functionId: string,
  chunks: Pick<Chunk, "filePath" | "type" | "name" | "parentChunk">[],
): string {
  const parts = functionId.split(":");
  if (parts.length >= 3) {
    return functionId;
  }

  const [rawFilePath, name] = parts;
  const filePath = normalizeFilePath(rawFilePath);
  const matches = chunks.filter(
    (chunk) =>
      normalizeFilePath(chunk.filePath) === filePath &&
      (chunk.name === name || getChunkQualifiedName(chunk) === name),
  );

  if (matches.length === 1) {
    return buildChunkNodeId(matches[0]);
  }

  return functionId;
}
