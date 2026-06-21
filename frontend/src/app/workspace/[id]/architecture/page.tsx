"use client";

import { useCallback, useEffect } from "react";
import { useParams } from "next/navigation";

import ArchitectureHeader from "../../../../components/architecture/ArchitectureHeader";
import ArchitectureStats from "../../../../components/architecture/ArchitectureStats";
import ArchitectureTabs from "../../../../components/architecture/ArchitectureTabs";
import GraphControls from "../../../../components/architecture/GraphControls";
import GraphCanvas from "../../../../components/architecture/GraphCanvas";
import NodeDetailsPanel from "../../../../components/architecture/NodeDetailsPanel";
import SearchBar from "../../../../components/architecture/SearchBar";
import WorkspaceSidebar from "../../../../components/platform/WorkspaceSidebar";
import { useArchitectureStore } from "../../../../store/useArchitectureStore";
export default function ArchitecturePage ()
{
  const params = useParams();
  const workspaceId =
    typeof params.id === "string"
      ? params.id
      : "6a345b5c5706652c317bf04d";
  const {
    activeView,
    setActiveView,
    graph,
    summary,
    loading,
    error,
    searchTerm,
    activeTypes,
    setSearchTerm,
    toggleType,
    clearFilters,
    loadDependenciesGraph,
    loadCallGraph,
    loadProjectFlow,
    loadSystemMap,
    loadSummary,
  } = useArchitectureStore();

  const refresh = useCallback(() => {
    if (!workspaceId) return;

    switch (activeView)
    {
      case "dependencies":
        loadDependenciesGraph(workspaceId);
        break;

      case "callgraph":
        loadCallGraph(workspaceId);
        break;

      case "projectflow":
        loadProjectFlow(workspaceId);
        break;

      case "systemmap":
        loadSystemMap(workspaceId);
        break;
    }

    loadSummary(workspaceId);
  }, [
    activeView,
    loadCallGraph,
    loadDependenciesGraph,
    loadSystemMap,
    loadProjectFlow,
    loadSummary,
    workspaceId,
  ]);

  useEffect(() =>
  {
    refresh();
  }, [refresh]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#06090d] text-slate-100">
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ArchitectureHeader
          loading={loading}
          onRefresh={refresh}
        />

        <ArchitectureTabs
          activeView={activeView}
          onChange={setActiveView}
        />

        <ArchitectureStats graph={graph} summary={summary} />

        <div className="flex h-14 items-center justify-between border-b border-white/[0.07] bg-[#080c12] px-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <GraphControls
            activeTypes={activeTypes}
            onToggleType={toggleType}
            onClear={clearFilters}
          />
        </div>

        {error && (
          <div className="border-b border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs text-amber-100">
            {error}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 min-w-0">
            <GraphCanvas />
          </div>
          <NodeDetailsPanel workspaceId={workspaceId} />
        </div>
      </section>
      <WorkspaceSidebar workspaceId={workspaceId} />
    </div>
  );
}
