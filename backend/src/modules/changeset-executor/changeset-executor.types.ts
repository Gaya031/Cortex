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

export interface MoveFunctionOperation{
    function: string;
    from : string;
    to: string;
}

export interface RenameFunctionOperation{
    oldName: string;
    newName: string;
}

export interface ChangeSet{
    moveFunctions?: {
        function: string;
        from: string;
        to: string;
    }[];
    renameFunction?: {
        oldName: string;
        newName: string;
    }[];
    warnings?: string[];
}

