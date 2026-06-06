export interface FileExplanation{
    file: string;
    chunks: {
        name: string,
        type: string,
    }[];
    dependencies: string[];
    dependents: string[];
    metrics: {
        chunkCount: number;
        dependencyCount: number;
        dependentCount: number;
    };
}
