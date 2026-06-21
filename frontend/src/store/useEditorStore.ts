import { create } from "zustand";

import { fileApi } from "@/services/file.api";
import {
  EditorTab,
  FileTreeNode,
  ProjectFile,
} from "@/types/file.types";
import { buildFileTree } from "@/utils/files/buildFileTree";

export interface RefactorPlanResult {
  plan: {
    summary: string;
    actions: Array<{
      type: string;
      oldName?: string;
      newName?: string;
      function?: string;
      from?: string;
      to?: string;
    }>;
  };
  changeSet: {
    createFiles: string[];
    moveFunctions: Array<{ function: string; from: string; to: string }>;
    renameFunctions: Array<{ oldName: string; newName: string }>;
    updateImports: Array<{ file: string; reason: string }>;
    warnings: string[];
  };
}

interface EditorStore {
  files: ProjectFile[];
  tree: FileTreeNode[];
  tabs: EditorTab[];
  activePath: string | null;
  splitPath: string | null;
  splitEnabled: boolean;
  loadingFiles: boolean;
  loadingContent: boolean;
  saving: boolean;
  aiLoading: boolean;
  aiResult: string;
  refactorPlan: RefactorPlanResult | null;
  searchTerm: string;
  replaceTerm: string;
  error: string | null;
  loadFiles: (workspaceId: string) => Promise<void>;
  refreshOpenTabs: (workspaceId: string) => Promise<void>;
  openFile: (
    workspaceId: string,
    filePath: string,
    targetPane?: "main" | "split",
  ) => Promise<void>;
  setActivePath: (path: string) => void;
  closeTab: (path: string) => void;
  updateActiveContent: (content: string) => void;
  saveActiveFile: (workspaceId: string) => Promise<void>;
  toggleSplit: () => void;
  setSearchTerm: (term: string) => void;
  setReplaceTerm: (term: string) => void;
  replaceInActiveFile: () => void;
  explainActiveFile: (workspaceId: string) => Promise<void>;
  planRefactor: (workspaceId: string) => Promise<void>;
  clearAiResult: () => void;
}

function languageForPath(
  path: string,
  fallback?: string,
) {
  const extension = path.split(".").pop()?.toLowerCase();

  if (fallback && fallback !== "unknown") {
    return fallback;
  }

  const map: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    json: "json",
    css: "css",
    scss: "scss",
    html: "html",
    md: "markdown",
    py: "python",
    java: "java",
    go: "go",
    rs: "rust",
  };

  return map[extension ?? ""] ?? "plaintext";
}

export const useEditorStore = create<EditorStore>(
  (set, get) => ({
    files: [],
    tree: [],
    tabs: [],
    activePath: null,
    splitPath: null,
    splitEnabled: false,
    loadingFiles: false,
    loadingContent: false,
    saving: false,
    aiLoading: false,
    aiResult: "",
    refactorPlan: null,
    searchTerm: "",
    replaceTerm: "",
    error: null,

    loadFiles: async (workspaceId) => {
      try {
        set({
          loadingFiles: true,
          error: null,
        });
        const files =
          await fileApi.getWorkspaceFiles(workspaceId);

        set({
          files,
          tree: buildFileTree(files),
        });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Could not load files.",
        });
      } finally {
        set({ loadingFiles: false });
      }
    },

    refreshOpenTabs: async (workspaceId) => {
      const tabs = get().tabs;

      if (!tabs.length) {
        return;
      }

      try {
        const refreshed = await Promise.all(
          tabs.map(async (tab) => {
            try {
              const content = await fileApi.getFileContent(
                workspaceId,
                tab.path,
              );
              return {
                ...tab,
                content,
                originalContent: content,
                dirty: false,
              };
            } catch {
              return null;
            }
          }),
        );

        const nextTabs = refreshed.filter(
          (tab): tab is EditorTab => tab !== null,
        );
        const nextPaths = new Set(nextTabs.map((tab) => tab.path));

        set((state) => ({
          tabs: nextTabs,
          activePath:
            state.activePath && nextPaths.has(state.activePath)
              ? state.activePath
              : nextTabs.at(-1)?.path ?? null,
          splitPath:
            state.splitPath && nextPaths.has(state.splitPath)
              ? state.splitPath
              : null,
        }));
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Could not refresh open files.",
        });
      }
    },

    openFile: async (
      workspaceId,
      filePath,
      targetPane = "main",
    ) => {
      const existing = get().tabs.find(
        (tab) => tab.path === filePath,
      );

      if (existing) {
        set({
          activePath:
            targetPane === "main"
              ? filePath
              : get().activePath,
          splitPath:
            targetPane === "split"
              ? filePath
              : get().splitPath,
        });
        return;
      }

      try {
        set({
          loadingContent: true,
          error: null,
        });

        const content = await fileApi.getFileContent(
          workspaceId,
          filePath,
        );
        const file = get().files.find(
          (item) => item.path === filePath,
        );

        const tab: EditorTab = {
          path: filePath,
          content,
          originalContent: content,
          dirty: false,
          language: languageForPath(filePath, file?.language),
        };

        set((state) => ({
          tabs: [...state.tabs, tab],
          activePath:
            targetPane === "main" ? filePath : state.activePath,
          splitPath:
            targetPane === "split" ? filePath : state.splitPath,
        }));
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Could not open file.",
        });
      } finally {
        set({ loadingContent: false });
      }
    },

    setActivePath: (path) => {
      set({ activePath: path });
    },

    closeTab: (path) => {
      set((state) => {
        const tabs = state.tabs.filter(
          (tab) => tab.path !== path,
        );
        const activePath =
          state.activePath === path
            ? tabs.at(-1)?.path ?? null
            : state.activePath;
        const splitPath =
          state.splitPath === path ? null : state.splitPath;

        return {
          tabs,
          activePath,
          splitPath,
        };
      });
    },

    updateActiveContent: (content) => {
      const activePath = get().activePath;

      if (!activePath) {
        return;
      }

      set((state) => ({
        tabs: state.tabs.map((tab) =>
          tab.path === activePath
            ? {
                ...tab,
                content,
                dirty: content !== tab.originalContent,
              }
            : tab,
        ),
      }));
    },

    saveActiveFile: async (workspaceId) => {
      const activePath = get().activePath;
      const tab = get().tabs.find(
        (item) => item.path === activePath,
      );

      if (!activePath || !tab) {
        return;
      }

      try {
        set({
          saving: true,
          error: null,
        });
        await fileApi.saveFileContent(
          workspaceId,
          activePath,
          tab.content,
        );

        set((state) => ({
          tabs: state.tabs.map((item) =>
            item.path === activePath
              ? {
                  ...item,
                  originalContent: item.content,
                  dirty: false,
                }
              : item,
          ),
        }));
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Could not save file.",
        });
      } finally {
        set({ saving: false });
      }
    },

    toggleSplit: () => {
      set((state) => ({
        splitEnabled: !state.splitEnabled,
        splitPath:
          !state.splitEnabled &&
          !state.splitPath &&
          state.activePath
            ? state.activePath
            : state.splitPath,
      }));
    },

    setSearchTerm: (term) => set({ searchTerm: term }),

    setReplaceTerm: (term) => set({ replaceTerm: term }),

    replaceInActiveFile: () => {
      const { searchTerm, replaceTerm, activePath, tabs } =
        get();
      const tab = tabs.find(
        (item) => item.path === activePath,
      );

      if (!tab || !searchTerm) {
        return;
      }

      get().updateActiveContent(
        tab.content.replaceAll(searchTerm, replaceTerm),
      );
    },

    explainActiveFile: async (workspaceId) => {
      const activePath = get().activePath;

      if (!activePath) {
        return;
      }

      try {
        set({
          aiLoading: true,
          aiResult: "",
          error: null,
        });
        const result = await fileApi.explainFile(
          workspaceId,
          activePath,
        );
        set({ aiResult: String(result) });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Could not explain file.",
        });
      } finally {
        set({ aiLoading: false });
      }
    },

    planRefactor: async (workspaceId) => {
      const activePath = get().activePath;

      if (!activePath) {
        return;
      }

      try {
        set({
          aiLoading: true,
          aiResult: "",
          refactorPlan: null,
          error: null,
        });
        const result = await fileApi.generateRefactorPlan(
          workspaceId,
          `Refactor ${activePath} for clarity, safety, and maintainability.`,
        );
        set({
          aiResult: result.plan?.summary ?? "",
          refactorPlan: result,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Could not create refactor plan.",
        });
      } finally {
        set({ aiLoading: false });
      }
    },

    clearAiResult: () => {
      set({ aiResult: "", refactorPlan: null });
    },
  }),
);
