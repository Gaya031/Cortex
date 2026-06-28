import path from "path";
import { normalizeFilePath } from "./path.util.js";

export interface PathAliasConfig {
  baseUrl: string;
  paths: Record<string, string[]>;
}

const DEFAULT_ALIASES: PathAliasConfig = {
  baseUrl: ".",
  paths: {
    "@/*": ["src/*"],
    "~/*": ["src/*"],
  },
};

export function parseTsConfigPaths(
  content: string,
  configDir = ".",
): PathAliasConfig | null {
  try {
    const json = JSON.parse(stripJsonComments(content)) as {
      compilerOptions?: {
        baseUrl?: string;
        paths?: Record<string, string[]>;
      };
    };

    const compilerOptions = json.compilerOptions;
    if (!compilerOptions?.paths) return null;

    const baseUrl = normalizeFilePath(
      compilerOptions.baseUrl
        ? path.posix.join(normalizeFilePath(configDir), compilerOptions.baseUrl)
        : normalizeFilePath(configDir),
    );

    const paths: Record<string, string[]> = {};
    for (const [pattern, targets] of Object.entries(compilerOptions.paths)) {
      paths[pattern] = targets.map((target) =>
        normalizeFilePath(path.posix.join(baseUrl, target.replace(/^\.\//, ""))),
      );
    }

    return { baseUrl, paths };
  } catch {
    return null;
  }
}

function stripJsonComments(raw: string): string {
  return raw
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

export function resolveAliasImportPath(
  importPath: string,
  config: PathAliasConfig,
): string | null {
  for (const [pattern, replacements] of Object.entries(config.paths)) {
    const starIndex = pattern.indexOf("*");
    if (starIndex === -1) continue;

    const prefix = pattern.slice(0, starIndex);
    const suffix = pattern.slice(starIndex + 1);

    if (!importPath.startsWith(prefix)) continue;
    if (suffix && !importPath.endsWith(suffix)) continue;

    const matched = importPath.slice(
      prefix.length,
      suffix ? importPath.length - suffix.length : undefined,
    );

    for (const replacement of replacements) {
      const repStar = replacement.indexOf("*");
      if (repStar === -1) continue;

      const resolved = `${replacement.slice(0, repStar)}${matched}${replacement.slice(repStar + 1)}`;
      return normalizeFilePath(resolved);
    }
  }

  return null;
}

export function mergePathAliasConfigs(
  ...configs: Array<PathAliasConfig | null | undefined>
): PathAliasConfig {
  const merged: PathAliasConfig = {
    baseUrl: ".",
    paths: { ...DEFAULT_ALIASES.paths },
  };

  for (const config of configs) {
    if (!config) continue;
    if (config.baseUrl) merged.baseUrl = config.baseUrl;
    merged.paths = { ...merged.paths, ...config.paths };
  }

  return merged;
}

export function getDefaultPathAliases(): PathAliasConfig {
  return { ...DEFAULT_ALIASES, paths: { ...DEFAULT_ALIASES.paths } };
}
