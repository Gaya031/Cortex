import { GraphRepository } from "../graph/graph.repository.js";

export class ArchitectureService {
  private readonly graphRepository = new GraphRepository();

  async getCriticalFile(workspaceId: string) {
    const importEdges = await this.graphRepository.getFileImportEdges(workspaceId);
    const counts = new Map<string, number>();

    for (const edge of importEdges) {
      counts.set(edge.target, (counts.get(edge.target) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([file, count]) => ({
        file: file.replace("file:", ""),
        importCount: count,
      }));
  }

  async getOrphanFiles(workspaceId: string) {
    const files = await this.graphRepository.getFileNodes(workspaceId);

    const importEdges = await this.graphRepository.getFileImportEdges(workspaceId);

    const incomingTargets = new Set(importEdges.map((edge) => edge.target));

    const outgoingSources = new Set(importEdges.map((edge) => edge.source));
    const ENTRY_FILES = [
      "src/index.ts",
      "src/main.ts",
      "src/main.tsx",
      "src/app.ts",
      "src/app.tsx",
    ]
    return files
      .filter((file) => {
        if(file.filePath && ENTRY_FILES.includes(file.filePath))return false;
        const hasIncoming = incomingTargets.has(file.nodeId);
        const hasOutgoing = outgoingSources.has(file.nodeId);
        return !hasIncoming && !hasOutgoing;
      })
      .map((file) => ({
        file: file.filePath ?? file.name.replace("file: ", ""),
      }));
  }

  async getHighglyCoupledFiles(workspaceId: string) {
    const importEdges = await this.graphRepository.getFileImportEdges(workspaceId);
    const counts = new Map<string, number>();

    for (const edge of importEdges) {
      counts.set(edge.source, (counts.get(edge.source) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([file, score]) => ({
        file: file.replace("file:", ""),
        couplingScore: score,
      }))
      .filter((file) => file.couplingScore >= 3);
  }

  async detectCircularDependencies(workspaceId: string) {
    const importEdges = await this.graphRepository.getFileImportEdges(workspaceId);

    const graph = new Map<string, string[]>();

    for (const edge of importEdges) {
      if (!graph.has(edge.source)) {
        graph.set(edge.source, []);
      }
      graph.get(edge.source)!.push(edge.target);
    }

    const visited = new Set<string>();

    const recursionStack = new Set<string>();

    const cycles: string[][] = [];

    const dfs = (node: string, path: string[]) => {
      visited.add(node);
      recursionStack.add(node);
      const neighbours = graph.get(node) ?? [];
      for (const neighbour of neighbours) {
        if (!visited.has(neighbour)) {
          dfs(neighbour, [...path, neighbour]);
        } else if (recursionStack.has(neighbour)) {
          const cycleStartIndex = path.indexOf(neighbour);
          if (cycleStartIndex !== -1) {
            const cycle = path.slice(cycleStartIndex);
            cycle.push(neighbour);
            cycles.push(cycle);
          }
        }
      }
      recursionStack.delete(node);
    };

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        dfs(node, [node]);
      }
    }

    const uniqueCycles = new Map<string, string[]>();

    for (const cycle of cycles) {
      const normalized = [...cycle].sort().join("->");
      if (!uniqueCycles.has(normalized)) {
        uniqueCycles.set(normalized, cycle);
      }
    }

    return Array.from(uniqueCycles.values()).map((cycle) => ({
      cycle: cycle.map((file) => file.replace("file:", "")),
    }));
  }

  async getArchitectureSummary(workspaceId: string) {
    const [
      files,
      criticalFiles,
      orphanFiles,
      highglyCoupledFiles,
      circularDependencies,
      importEdges,
    ] = await Promise.all([
      this.graphRepository.getFileNodes(workspaceId),
      this.getCriticalFile(workspaceId),
      this.getOrphanFiles(workspaceId),
      this.getHighglyCoupledFiles(workspaceId),
      this.detectCircularDependencies(workspaceId),
      this.graphRepository.getFileImportEdges(workspaceId),
    ]);

    return {
      totalFiles: files.length,
      criticalFiles,
      orphanFiles,
      highglyCoupledFiles,
      circularDependencies,
      metrics: {
        totalDependencies: importEdges.length,
        orphanCount: orphanFiles.length,
        criticalCount: criticalFiles.length,
        circularCount: circularDependencies.length,
      },
    };
  }

  async getImpactAnalysis(workspacId: string, filePath: string){
    const importEdges = await this.graphRepository.getFileImportEdges(workspacId);
    const reverseGraph = new Map<string, string[]>();

    for(const edge of importEdges){
      if(!reverseGraph.has(edge.target)){
        reverseGraph.set(edge.target, []);
      }
      reverseGraph.get(edge.target)!.push(edge.source);
    }
    const visited = new Set<string>();
    const affectedFiles = new Set<string>();

    const dfs = (node: string) => {
      const dependents = reverseGraph.get(node) ?? [];
      for(const dependent of dependents){
        if(visited.has(dependent)){
          continue;
        }
        visited.add(dependent);
        affectedFiles.add(dependent);
        dfs(dependent);
      }
    };
    const startNode = `file:${filePath}`;
    dfs(startNode);
    return {
      file: filePath,
      impactScore: affectedFiles.size,
      affectedFiles: Array.from(affectedFiles).map((file) => file.replace("file:", ""))
    }
  };
  
}
