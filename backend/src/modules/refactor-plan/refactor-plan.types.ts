export interface RefactorPlan{
    obbjectives: string;
    newFiles: string[];
    moves: {
        from: string;
        to: string;
        functions: string[];
    }[];
    reasoning: string[];
    estimatedBenefits: string[];
}
