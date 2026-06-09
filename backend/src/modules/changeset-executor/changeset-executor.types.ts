export interface ExecuteChangeSetRequest{
    workspaceId: string;
    changeSet: {
        moveFunctions: {
            function: string;
            from: string;
            to: string;
        }[];
    };
}
