import { env } from "../../config/env.js";

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".gemini",
  "coverage",
  "out",
  ".vercel",
  ".idea",
  ".vscode",
]);

const SUPPORTED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

export interface GithubRepoRef {
  owner: string;
  repo: string;
  branch: string;
  token?: string;
}

export interface GithubFileEntry {
  path: string;
  content: string;
  extension: string;
  language: string;
  size: number;
}

export function parseGithubUrl(
  input: string,
): { owner: string; repo: string } | null {
  const trimmed = input.trim().replace(/\.git$/, "").replace(/\/$/, "");
  const urlMatch = trimmed.match(/github\.com[/:]([^/]+)\/([^/]+)/);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }
  const shortMatch = trimmed.match(/^([^/]+)\/([^/]+)$/);
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2] };
  }
  return null;
}

export class GithubService {
  private getToken(override?: string) {
    return override || env.githubToken;
  }

  private headers(token?: string) {
    const authToken = this.getToken(token);
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "cortex-code-indexer",
    };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    return headers;
  }

  async resolveDefaultBranch(ref: GithubRepoRef): Promise<string> {
    const res = await fetch(
      `https://api.github.com/repos/${ref.owner}/${ref.repo}`,
      { headers: this.headers(ref.token) },
    );
    if (!res.ok) {
      throw new Error(`GitHub repo lookup failed: ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as { default_branch?: string };
    return ref.branch || data.default_branch || "main";
  }

  async listRepositoryFiles(
    ref: GithubRepoRef,
    options?: { maxFiles?: number; maxFileSize?: number },
  ): Promise<GithubFileEntry[]> {
    const maxFiles = options?.maxFiles ?? 2000;
    const maxFileSize = options?.maxFileSize ?? 512_000;
    const branch = await this.resolveDefaultBranch(ref);

    const treeRes = await fetch(
      `https://api.github.com/repos/${ref.owner}/${ref.repo}/git/trees/${branch}?recursive=1`,
      { headers: this.headers(ref.token) },
    );
    if (!treeRes.ok) {
      throw new Error(
        `GitHub tree fetch failed: ${treeRes.status} ${treeRes.statusText}`,
      );
    }

    const treeData = (await treeRes.json()) as {
      tree?: Array<{ path?: string; type?: string; size?: number }>;
    };

    const blobPaths =
      treeData.tree
        ?.filter((entry) => {
          if (entry.type !== "blob" || !entry.path) return false;
          if (entry.size && entry.size > maxFileSize) return false;
          const parts = entry.path.split("/");
          if (parts.some((part) => IGNORED_DIRS.has(part))) return false;
          return SUPPORTED_EXTENSIONS.some((ext) => entry.path!.endsWith(ext));
        })
        .map((entry) => entry.path!)
        .slice(0, maxFiles) ?? [];

    const files: GithubFileEntry[] = [];
    const concurrency = 8;

    for (let i = 0; i < blobPaths.length; i += concurrency) {
      const batch = blobPaths.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(async (filePath) => {
          try {
            return await this.fetchFileContent(ref, filePath, branch);
          } catch (error) {
            console.warn(`Skipping GitHub file ${filePath}:`, error);
            return null;
          }
        }),
      );
      files.push(...batchResults.filter((f): f is GithubFileEntry => f !== null));
    }

    return files;
  }

  async fetchFileContent(
    ref: GithubRepoRef,
    filePath: string,
    branch?: string,
  ): Promise<GithubFileEntry> {
    const resolvedBranch = branch || (await this.resolveDefaultBranch(ref));
    const encodedPath = filePath
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    const res = await fetch(
      `https://api.github.com/repos/${ref.owner}/${ref.repo}/contents/${encodedPath}?ref=${resolvedBranch}`,
      { headers: this.headers(ref.token) },
    );
    if (!res.ok) {
      throw new Error(
        `GitHub content fetch failed for ${filePath}: ${res.status}`,
      );
    }

    const data = (await res.json()) as {
      content?: string;
      encoding?: string;
      size?: number;
    };

    let content = "";
    if (data.encoding === "base64" && data.content) {
      content = Buffer.from(data.content, "base64").toString("utf-8");
    } else if (data.content) {
      content = data.content;
    }

    const extension = filePath.split(".").pop() ?? "";
    const language =
      filePath.endsWith(".ts") || filePath.endsWith(".tsx")
        ? "typescript"
        : "javascript";

    return {
      path: filePath,
      content,
      extension,
      language,
      size: data.size ?? Buffer.byteLength(content, "utf8"),
    };
  }

  async updateFileContent(
    ref: GithubRepoRef,
    filePath: string,
    content: string,
    message = "Update via Cortex Code",
  ) {
    const branch = await this.resolveDefaultBranch(ref);
    const encodedPath = filePath
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    let sha: string | undefined;
    const getRes = await fetch(
      `https://api.github.com/repos/${ref.owner}/${ref.repo}/contents/${encodedPath}?ref=${branch}`,
      { headers: this.headers(ref.token) },
    );
    if (getRes.ok) {
      const existing = (await getRes.json()) as { sha?: string };
      sha = existing.sha;
    }

    const body: Record<string, string> = {
      message,
      content: Buffer.from(content, "utf-8").toString("base64"),
      branch,
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(
      `https://api.github.com/repos/${ref.owner}/${ref.repo}/contents/${encodedPath}`,
      {
        method: "PUT",
        headers: {
          ...this.headers(ref.token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!putRes.ok) {
      const errText = await putRes.text();
      throw new Error(`GitHub write failed for ${filePath}: ${putRes.status} ${errText}`);
    }
  }

  async listUserRepos(token?: string) {
    const res = await fetch(
      "https://api.github.com/user/repos?sort=updated&per_page=100",
      { headers: this.headers(token) },
    );
    if (!res.ok) {
      throw new Error(`GitHub repos list failed: ${res.status}`);
    }
    const repos = (await res.json()) as Array<{
      full_name: string;
      default_branch: string;
      private: boolean;
    }>;
    return repos.map((repo) => ({
      fullName: repo.full_name,
      defaultBranch: repo.default_branch,
      private: repo.private,
    }));
  }
}
