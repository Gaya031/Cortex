export interface RiskAnalysis{
    function: string;
    impactScore: number;
    affectedFunctions: string[];
    riskScore: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    reasons: string[];
    // recommended: boolean;
}

