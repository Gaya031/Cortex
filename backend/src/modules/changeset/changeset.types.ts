export interface ChangeSet{
    createFiles: string[];
    moveFunctions: {
        function: string;
        from: string;
        to: string;
    }[];
    updateImports: {
        file: string;
        reason: string;
    }[];
    warnings: string[];
}
