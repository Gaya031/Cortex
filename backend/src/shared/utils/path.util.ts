export function normalizeFilePath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/+/g, "/");
}

export function toFileNodeId(filePath: string): string {
  return `file:${normalizeFilePath(filePath)}`;
}

export function fromFileNodeId(nodeId: string): string {
  return normalizeFilePath(nodeId.replace(/^file:/, ""));
}
