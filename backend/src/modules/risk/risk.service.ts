import { ArchitectureService } from "../architecture/architecture.service.js";
import { CallgraphService } from "../callgraph/callgraph.service.js";
import { RiskAnalysis } from "./risk.types.js";

export class RiskService {
  private readonly callgraphService = new CallgraphService();
    private readonly architecureService = new ArchitectureService();

  async analyzeFunctionRisk(workspaceId: string, functionId: string): Promise<RiskAnalysis> {
    const impact = await this.callgraphService.getFunctionImpact(
      workspaceId,
      functionId,
    );
    const architecture = await this.architecureService.getArchitectureSummary(workspaceId);

    let riskScore = impact.impactScore * 5;
    const reasons: string[] = [];

    if(impact.impactScore > 0) reasons.push(`Function impacts ${impact.impactScore} upstream functions.`);
    const circularDependencyCount = architecture.circularDependencies.length;

    if(circularDependencyCount > 0) {
        riskScore += circularDependencyCount * 5;
        reasons.push(`${circularDependencyCount} circular dependecies detected in repository.`);
    }

    const highlyCoupledCount = architecture.highglyCoupledFiles.length;
    if(highlyCoupledCount > 0){
        riskScore += highlyCoupledCount * 3;
        reasons.push(`${highlyCoupledCount} highly coupled files detected.`);
    }

    let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";

    if(riskScore >= 50){
        riskLevel = "HIGH";
    }else if(riskScore >= 20) riskLevel = "MEDIUM";
    else riskLevel = "LOW";

    const recommended = riskLevel !== "HIGH";
    return {
      function: functionId,
      impactScore: impact.impactScore,
      affectedFunctions: impact.affectedFunctions,
      riskScore,
      riskLevel,
      reasons,
      // recommended,
    };
  }
}
