import { AIService } from "../ai/ai.service.js";
import { ArchitectureService } from "../architecture/architecture.serivce.js";
import { DecisionService } from "../decision/decision.service.js";
import { aiReviewPrompt } from "../../shared/prompts/aiReview.prompt.js";
import { parseAIJson } from "../../shared/utils/ai.utils.js";

export class IntelligenceService {
  private readonly architectureService = new ArchitectureService();
  private readonly decisionService = new DecisionService();
  private readonly aiService = new AIService();

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

  async getHealthScore(workspaceId: string) {
    const architecture =
      await this.architectureService.getArchitectureSummary(workspaceId);

    let score = 100;
    score -= architecture.circularDependencies.length * 10;
    score -= architecture.orphanFiles.length * 2;
    score -= architecture.highglyCoupledFiles.length * 3;
    score -= Math.floor(architecture.criticalFiles.length * 0.5);
    if (score < 0) {
      score = 0;
    }

    let grade: "A" | "B" | "C" | "D";
    if (score > 85) grade = "A";
    else if (score >= 70) grade = "B";
    else if (score >= 50) grade = "C";
    else grade = "D";

    let status: string;

    if (score >= 85) {
      status = "Excellent";
    } else if (score >= 70) {
      status = "Healthy";
    } else if (score >= 50) {
      status = "Needs Attention";
    } else {
      status = "Critical";
    }

    const strengths: string[] = [];
    const issues: string[] = [];

    if (architecture.highglyCoupledFiles.length === 0) {
      strengths.push("No highly coupled files detected");
    }

    if (architecture.circularDependencies.length === 0) {
      strengths.push("No circular dependencies detected");
    }

    if (architecture.metrics.totalDependencies < 30) {
      strengths.push("Dependency graph remains manageable");
    }

    if (architecture.circularDependencies.length > 0) {
      issues.push(
        `${architecture.circularDependencies.length} circular dependency detected`,
      );
    }

    if (architecture.orphanFiles.length > 0) {
      issues.push(`${architecture.orphanFiles.length} orphan files found`);
    }

    if (architecture.highglyCoupledFiles.length > 0) {
      issues.push(
        `${architecture.highglyCoupledFiles.length} highly coupled files found`,
      );
    }

    let recommendation = "Repository architecture looks healthy.";

    if (architecture.circularDependencies.length > 0) {
      recommendation =
        "Break circular dependencies and remove orphan files to improve repository health.";
    } else if (architecture.orphanFiles.length > 0) {
      recommendation =
        "Review and remove orphan files that are no longer used.";
    } else if (architecture.highglyCoupledFiles.length > 0) {
      recommendation =
        "Reduce coupling between modules to improve maintainability.";
    }
    return {
      score,
      grade,
      status,
      strengths,
      issues,
      recommendation,
      summary: {
        totalFiles: architecture.totalFiles,
        criticalFiles: architecture.criticalFiles.length,
        orphanFiles: architecture.orphanFiles.length,
        circularDependecies: architecture.circularDependencies.length,
        highlyCoupledFiles: architecture.highglyCoupledFiles.length,
        totalDependenceis: architecture.metrics.totalDependencies,
      },
      deductions: {
        circularDependencies: architecture.circularDependencies.length * 10,
        orphanFiles: architecture.orphanFiles.length * 2,
        highlyCoupledFiles: architecture.highglyCoupledFiles.length * 3,
        criticalFiles: Math.floor(architecture.criticalFiles.length * 0.5),
      },
    };
  }

  async getRepositoryReport(workspaceId: string) {
    const [architecture, risks, health] = await Promise.all([
      this.architectureService.getArchitectureSummary(workspaceId),
      this.getRiskAnalysis(workspaceId),
      this.getHealthScore(workspaceId),
    ]);

    const recommendationActions: string[] = [];
    for (const cycle of architecture.circularDependencies) {
      recommendationActions.push(
        `Break circular dependency involving: ${cycle.cycle.join(" -> ")}`,
      );
    }

    for (const orphan of architecture.orphanFiles) {
      recommendationActions.push(`Review Orphan file: ${orphan.file}`);
    }

    for (const file of architecture.highglyCoupledFiles) {
      recommendationActions.push(`Reduce coupling in ${file.file}`);
    }

    const topRisks = risks.slice(0, 5);

    return {
      generatedAt: new Date(),
      health,
      architecture: {
        criticalFiles: architecture.criticalFiles,
        orphanFiles: architecture.orphanFiles,
        circularDependencies: architecture.circularDependencies,
        highlyCoupledFiles: architecture.highglyCoupledFiles,
        metrics: architecture.metrics,
      },
      topRisks,
      recommendationActions,
    };
  }

  async getAIReview(workspaceId: string) {
    const report = await this.getRepositoryReport(workspaceId);
    const prompt = aiReviewPrompt(report);
    const response = await this.aiService.generate(prompt);
    if (!response) throw new Error("AI review generation failed");
    const cleaned = parseAIJson(response);

    try {
      return JSON.parse(cleaned);
    } catch (err) {
      return {
        raw: response,
      };
    }
  }
}
