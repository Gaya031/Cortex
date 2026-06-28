export type GraphViewType =
  | "dependencies"
  | "callgraph"
  | "projectflow"
  | "systemmap"
  | "insights";

export interface ArchitectureNode {
  id: string;
  label?: string;
  name?: string;
  type: string;
  filePath?: string;
  path?: string;
  impact?: number;
  riskScore?: number;
}

export interface ArchitectureEdge {
  id?: string;
  source: string;
  target: string;
  relation?: string;
  from?: string;
  to?: string;
}

export interface ArchitectureGraph {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}

export interface CriticalFile {
  file: string;
  importCount: number;
}

export interface OrphanFile {
  file: string;
}

export interface HighlyCoupledFile {
  file: string;
  couplingScore: number;
}

export interface CircularDependency {
  cycle: string[];
}

export interface ArchitectureMetrics {
  totalDependencies: number;
  orphanCount: number;
  criticalCount: number;
  circularCount: number;
}

export interface ArchitectureSummary {
  totalFiles: number;

  criticalFiles: CriticalFile[];

  orphanFiles: OrphanFile[];

  highglyCoupledFiles: HighlyCoupledFile[];

  circularDependencies: CircularDependency[];

  metrics: ArchitectureMetrics;
}

export interface FunctionImpact {
  function: string;
  impactScore: number;
  affectedFunctions: string[];
}

export interface FileImpact {
  file: string;
  impactScore: number;
  affectedFiles: string[];
}

export interface DownstreamImpact {
  function: string;
  downStreamImpactScore: number;
  affectedFunctions: string[];
}

export interface NodeDetails {
  id: string;
  name: string;
  type: string;
  filePath: string;

  imports?: string[];
  exports?: string[];

  calls?: string[];
  calledBy?: string[];
}
