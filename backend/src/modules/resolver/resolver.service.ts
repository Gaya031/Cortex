import path from "path";
import { FileRepository } from "../file/file.repository.js";

export class ResolverService {
  private readonly fileRepository = new FileRepository();

  resolveImport(currentFilePath: string, importPath: string) {
    if (!importPath.startsWith(".")) return null;
    const currentDir = path.dirname(currentFilePath);
    const resolvedPath = path.normalize(path.join(currentDir, importPath));
    return resolvedPath.replace(/\\/g, "/");
  }

  async resolveAndVerify(
    workspaceId: string,
    currentFilePath: string,
    importPath: string,
  ) {
    const resolved = this.resolveFile(workspaceId, currentFilePath, importPath);
    if (!resolved) return null;
    return resolved;
  }

  async resolveFile(
    workspaceId: string,
    currentFilePath: string,
    importPath: string,
  ) {
    const basePath = this.resolveImport(currentFilePath, importPath);

    if (!basePath) return null;

    const candidates = [
      `${basePath}.ts`,
      `${basePath}.tsx`,
      `${basePath}.js`,
      `${basePath}.jsx`,
      `${basePath}/index.ts`,
      `${basePath}/index.tsx`,
      `${basePath}/index.js`,
      `${basePath}/index.jsx`,
    ];

    const uniqueCandidates = [...new Set(candidates)];

    const files = await this.fileRepository.findByWorkspace(workspaceId);
    // repository stores the file path in the `path` field
    const fileSet = new Set(files.map((file) => file.path));

    for (const candidate of uniqueCandidates) {
      if (fileSet.has(candidate)) return candidate;
    }
  }

  isExternalImport(importPath: string) {
    return !importPath.startsWith(".");
  }
}
