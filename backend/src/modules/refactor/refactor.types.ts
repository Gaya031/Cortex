export interface RefactorRequest{
    workspaceId: string;
    filePath: string;
}

export interface RefactorRecommendation{
    problems: string[];
    recommendations: string[];
    estimatedImpact: string[];
}
