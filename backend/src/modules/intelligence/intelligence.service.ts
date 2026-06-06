import { ArchitectureService } from "../architecture/architecture.serivce.js";
import { DecisionService } from "../decision/decision.service.js";

export class IntelligenceService {
  private readonly architectureService = new ArchitectureService();
  private readonly decisionService = new DecisionService();

  async generateReport(workspaceId: string) {
    const architecture =
      await this.architectureService.getArchitectureSummary(workspaceId);
    const decision =
      await this.decisionService.getWorkspaceDecisions(workspaceId);

    return {
      workspaceId,
      architecture,
      decision,
      risks: {
        criticalFiles: architecture.criticalFiles,
        circularDependencies: architecture.circularDependencies,
        highlyCoupledFiles: architecture.highglyCoupledFiles,
        orphanFiles: architecture.orphanFiles,
      },
      generatedAt: new Date(),
    };
  }

  async getRiskAnalysis(workspaceId: string) {
    const architecture =
      await this.architectureService.getArchitectureSummary(workspaceId);
    const riskMap = new Map<
      string,
      {
        importCount: number;
        couplingScore: number;
        impactScore: number;
        circularDependencyCount: number;
      }
    >();

    for (const file of architecture.criticalFiles) {
      const current = riskMap.get(file.file) ?? {
        importCount: 0,
        couplingScore: 0,
        impactScore: 0,
        circularDependencyCount: 0,
      };
      current.importCount = file.importCount;
      riskMap.set(file.file, current);
    }

    for (const file of architecture.highglyCoupledFiles) {
      const current = riskMap.get(file.file) ?? {
        importCount: 0,
        couplingScore: 0,
        impactScore: 0,
        circularDependencyCount: 0,
      };
      current.couplingScore = file.couplingScore;
      riskMap.set(file.file, current);
    }

    for (const cycle of architecture.circularDependencies) {
      for (const file of cycle.cycle) {
        const current = riskMap.get(file) ?? {
          importCount: 0,
          couplingScore: 0,
          impactScore: 0,
          circularDependencyCount: 0,
        };
        current.circularDependencyCount++;
        riskMap.set(file, current);
      }
    }

    const results = [];

    for (const [file, metrics] of riskMap.entries()) {
      const impact = await this.architectureService.getImpactAnalysis(
        workspaceId,
        file,
      );

      const impactScore = impact.impactScore;
      const riskScore =
        metrics.importCount * 2 +
        metrics.couplingScore * 3 +
        impactScore * 4 +
        metrics.circularDependencyCount * 5;

      let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";

      if (riskScore >= 50) riskLevel = "HIGH";
      else if (riskScore >= 20) riskLevel = "MEDIUM";

      results.push({
        file,
        importCount: metrics.importCount,
        couplingScore: metrics.couplingScore,
        impactScore,
        circularDependencyCount: metrics.circularDependencyCount,
        riskScore,
        riskLevel,
      });
    }
    return results.sort((a, b) => b.riskScore - a.riskScore);
  }
}
