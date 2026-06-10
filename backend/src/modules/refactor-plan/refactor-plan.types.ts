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

export interface RefactorAction{
    type: "RENAME_FUNCTION" | "MOVE_FUNCTION";
    oldName?: string;
    newName?: string;

    function?: string;
    from?: string;
    to?: string;
}

export interface RefactorPlan{
    summary: string;
    actions: RefactorAction[];
    warnings: string[];
}
