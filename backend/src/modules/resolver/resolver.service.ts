import path from "path";
import { FileRepository } from "../file/file.repository.js";
import { normalizeFilePath } from "../../shared/utils/path.util.js";
import {
  getDefaultPathAliases,
  mergePathAliasConfigs,
  PathAliasConfig,
  parseTsConfigPaths,
  resolveAliasImportPath,
} from "../../shared/utils/path-alias.util.js";

const TS_CONFIG_CANDIDATES = [
  "tsconfig.json",
  "tsconfig.app.json",
  "tsconfig.base.json",
  "jsconfig.json",
  "frontend/tsconfig.json",
  "frontend/jsconfig.json",
  "backend/tsconfig.json",
  "client/tsconfig.json",
  "app/tsconfig.json",
];

export class ResolverService {
  private readonly fileRepository = new FileRepository();
  private workspaceFileSets = new Map<string, Set<string>>();
  private workspaceAliases = new Map<string, PathAliasConfig>();

  setWorkspaceFiles(workspaceId: string, filePaths: string[]) {
    this.workspaceFileSets.set(
      workspaceId,
      new Set(filePaths.map((filePath) => normalizeFilePath(filePath))),
    );
  }

  setPathAliases(workspaceId: string, config: PathAliasConfig) {
    this.workspaceAliases.set(workspaceId, config);
  }

  clearWorkspace(workspaceId: string) {
    this.workspaceFileSets.delete(workspaceId);
    this.workspaceAliases.delete(workspaceId);
  }

  async loadPathAliasesFromWorkspace(workspaceId: string): Promise<PathAliasConfig> {
    const configs: Array<PathAliasConfig | null> = [];

    for (const candidate of TS_CONFIG_CANDIDATES) {
      const file = await this.fileRepository.findByPath(workspaceId, candidate);
      if (!file?.content) continue;

      const configDir = normalizeFilePath(path.posix.dirname(candidate));
      configs.push(parseTsConfigPaths(file.content, configDir));
    }

    const merged = mergePathAliasConfigs(getDefaultPathAliases(), ...configs);
    this.workspaceAliases.set(workspaceId, merged);
    return merged;
  }

  private getFileSet(workspaceId: string) {
    return this.workspaceFileSets.get(workspaceId) ?? new Set<string>();
  }

  private getAliasConfig(workspaceId: string) {
    return this.workspaceAliases.get(workspaceId) ?? getDefaultPathAliases();
  }

  resolveImportPath(
    currentFilePath: string,
    importPath: string,
    workspaceId?: string,
  ): string | null {
    const normalizedImport = importPath.split("?")[0]?.split("#")[0] ?? importPath;

    if (normalizedImport.startsWith(".")) {
      const currentDir = path.posix.dirname(normalizeFilePath(currentFilePath));
      return normalizeFilePath(
        path.posix.join(currentDir, normalizedImport),
      );
    }

    if (workspaceId) {
      const aliasBase = resolveAliasImportPath(
        normalizedImport,
        this.getAliasConfig(workspaceId),
      );
      if (aliasBase) {
        return normalizeFilePath(aliasBase);
      }
    }

    return null;
  }

  resolveImport(currentFilePath: string, importPath: string) {
    return this.resolveImportPath(currentFilePath, importPath);
  }

  private findExistingFile(
    workspaceId: string,
    basePath: string,
  ): string | null {
    const fileSet = this.getFileSet(workspaceId);
    const normalizedBase = normalizeFilePath(basePath);

    const candidates = [
      normalizedBase,
      `${normalizedBase}.ts`,
      `${normalizedBase}.tsx`,
      `${normalizedBase}.js`,
      `${normalizedBase}.jsx`,
      `${normalizedBase}/index.ts`,
      `${normalizedBase}/index.tsx`,
      `${normalizedBase}/index.js`,
      `${normalizedBase}/index.jsx`,
    ];

    const uniqueCandidates = [...new Set(candidates)];

    for (const candidate of uniqueCandidates) {
      if (fileSet.has(candidate)) {
        return candidate;
      }
    }

    const suffixes = uniqueCandidates.flatMap((candidate) => {
      const parts = candidate.split("/");
      if (parts.length <= 1) return [];
      return [parts.slice(1).join("/"), parts.slice(-2).join("/")];
    });

    for (const suffix of suffixes) {
      for (const filePath of fileSet) {
        if (filePath === suffix || filePath.endsWith(`/${suffix}`)) {
          return filePath;
        }
      }
    }

    return null;
  }

  async resolveFile(
    workspaceId: string,
    currentFilePath: string,
    importPath: string,
  ) {
    const basePath = this.resolveImportPath(
      currentFilePath,
      importPath,
      workspaceId,
    );

    if (!basePath) return null;

    const existing = this.findExistingFile(workspaceId, basePath);
    if (existing) return existing;

    if (this.workspaceFileSets.size === 0 || !this.workspaceFileSets.has(workspaceId)) {
      const files = await this.fileRepository.findByWorkspace(workspaceId);
      this.setWorkspaceFiles(
        workspaceId,
        files.map((file) => file.path),
      );
      return this.findExistingFile(workspaceId, basePath);
    }

    return null;
  }

  isExternalImport(importPath: string) {
    return !importPath.startsWith(".") && !importPath.startsWith("@") && !importPath.startsWith("~");
  }
}
