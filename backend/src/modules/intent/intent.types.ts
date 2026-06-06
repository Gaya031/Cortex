export interface IntentRequest{
    workspaceId: string;
    goal: string;
}

export interface IntentResponse{
    problems: string[];
    suggestions: string[];
    impace: string[];
}

