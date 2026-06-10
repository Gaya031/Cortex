export interface ProjectContext{
    workspaceId: string;
    architecture: any;
    decisions: any[];
    risks: any[];
    generatedAt: Date;
}

export interface RepositoryContext{
    query: string;
    context: string;
    chunks: {
        filePath: string;
        content: string;
        score: number;
    }[];
}