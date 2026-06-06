export interface PlanningRequest{
    workspaceId: string;
    goal: string;
}

export interface RefactorPlan{
    roadmap: {
        phase: number;
        tasks: string[];
    }[];
}
