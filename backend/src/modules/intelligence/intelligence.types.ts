export interface IntelligenceReport {
  workspaceId: String;
  architecture: any;
  decisions: any[];
  risks: {
    criticalFile: any[];
    circularDependencies: any[];
    highlyCoupledFiles: any[];
    orphanFiles: any[];
  };
  impact: any[];
  generatedAt: Date;
}

export interface FileRisk {
  file: string;
  importCount: string;
  couplingScore: string;
  impactScore: string;
  circularDependencies: number;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
}
