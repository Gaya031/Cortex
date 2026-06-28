import { create } from "zustand";

import {
  ArchitectureGraph,
  ArchitectureSummary,
  DownstreamImpact,
  FileImpact,
  FunctionImpact,
  GraphViewType,
  ArchitectureNode,
} from "../types/architecture.types";

import { architectureApi } from "../services/architecture/architecture.api";

interface ArchitectureStore {
  activeView: GraphViewType;

  graph: ArchitectureGraph;

  summary: ArchitectureSummary | null;

  selectedNode: ArchitectureNode | null;

  impactResult: FunctionImpact | null;

  fileImpactResult: FileImpact | null;

  downstreamResult: DownstreamImpact | null;

  loading: boolean;
  error: string | null;
  searchTerm: string;
  activeTypes: string[];

  layoutDirection: "LR" | "TB";
  layoutSeed: number;
  setLayoutDirection: (dir: "LR" | "TB") => void;
  requestLayoutReset: () => void;
  setActiveView: (view: GraphViewType) => void;
  setSearchTerm: (term: string) => void;
  toggleType: (type: string) => void;
  clearFilters: () => void;

  setSelectedNode: (
    node: ArchitectureNode | null,
  ) => void;

  loadDependenciesGraph: (
    workspaceId: string,
  ) => Promise<void>;

  loadProjectFlow: (
    workspaceId: string,
  ) => Promise<void>;

  loadCallGraph: (
    workspaceId: string,
  ) => Promise<void>;

  loadSystemMap: (
    workspaceId: string,
  ) => Promise<void>;

  loadSummary: (
    workspaceId: string,
  ) => Promise<void>;

  loadImpact: (
    workspaceId: string,
    functionId: string,
  ) => Promise<void>;

  loadFileImpact: (
    workspaceId: string,
    filePath: string,
  ) => Promise<void>;

  loadDownstreamImpact: (
    workspaceId: string,
    functionId: string,
  ) => Promise<void>;
}

export const useArchitectureStore =
  create<ArchitectureStore>((set) => ({
    activeView: "dependencies",
    layoutDirection: "LR",
    layoutSeed: 0,

    graph: {
      nodes: [],
      edges: [],
    },

    summary: null,

    selectedNode: null,

    impactResult: null,

    fileImpactResult: null,

    downstreamResult: null,

    loading: false,
    error: null,
    searchTerm: "",
    activeTypes: [],

    setLayoutDirection: (dir) => set({ layoutDirection: dir }),

    requestLayoutReset: () =>
      set((state) => ({ layoutSeed: state.layoutSeed + 1 })),

    setActiveView: (view) => {
      const defaultDir =
        view === "projectflow" || view === "systemmap"
          ? "TB"
          : "LR";
      set({
        activeView: view,
        selectedNode: null,
        impactResult: null,
        fileImpactResult: null,
        downstreamResult: null,
        layoutDirection: defaultDir,
      });
    },

    setSearchTerm: (term) => set({ searchTerm: term }),

    toggleType: (type) =>
      set((state) => ({
        activeTypes: state.activeTypes.includes(type)
          ? state.activeTypes.filter((item) => item !== type)
          : [...state.activeTypes, type],
      })),

    clearFilters: () =>
      set({
        searchTerm: "",
        activeTypes: [],
      }),

    setSelectedNode: (node) => {
      set({
        selectedNode: node,
        impactResult: null,
        fileImpactResult: null,
        downstreamResult: null,
      });
    },

    loadDependenciesGraph: async (
      workspaceId,
    ) => {
      try {
        set({ loading: true, error: null });

        const graph =
          await architectureApi.getDependenciesGraph(
            workspaceId,
          );

        set({
          graph,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Could not load dependency graph.",
        });
      } finally {
        set({
          loading: false,
        });
      }
    },

    loadProjectFlow: async (
      workspaceId,
    ) => {
      try {
        set({ loading: true, error: null });

        const graph =
          await architectureApi.getProjectFlow(
            workspaceId,
          );

        set({
          graph,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Could not load project flow.",
        });
      } finally {
        set({
          loading: false,
        });
      }
    },

    loadCallGraph: async (
      workspaceId,
    ) => {
      try {
        set({ loading: true, error: null });

        const graph =
          await architectureApi.getCallGraph(
            workspaceId,
          );

        set({
          graph,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Could not load call graph.",
        });
      } finally {
        set({
          loading: false,
        });
      }
    },

    loadSystemMap: async (workspaceId) => {
      try {
        set({ loading: true, error: null });

        const graph =
          await architectureApi.getSystemMap(workspaceId);

        set({
          graph,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Could not load system map.",
        });
      } finally {
        set({
          loading: false,
        });
      }
    },

    loadSummary: async (
      workspaceId,
    ) => {
      try {
        const summary =
          await architectureApi.getSummary(
            workspaceId,
          );

        set({
          summary,
        });
      } catch {
        set({
          summary: null,
        });
      }
    },

    loadImpact: async (
      workspaceId,
      functionId,
    ) => {
      try {
        const impact =
          await architectureApi.getImpact(
            workspaceId,
            functionId,
          );

        set({
          impactResult: impact,
          fileImpactResult: null,
          downstreamResult: null,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Could not load impact analysis.",
        });
      }
    },

    loadFileImpact: async (workspaceId, filePath) => {
      try {
        const impact = await architectureApi.getFileImpact(
          workspaceId,
          filePath,
        );

        set({
          fileImpactResult: impact,
          impactResult: null,
          downstreamResult: null,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Could not load file impact analysis.",
        });
      }
    },

    loadDownstreamImpact: async (workspaceId, functionId) => {
      try {
        const impact = await architectureApi.getDownstreamImpact(
          workspaceId,
          functionId,
        );

        set({
          downstreamResult: impact,
          impactResult: null,
          fileImpactResult: null,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Could not load downstream impact.",
        });
      }
    },
  }));
