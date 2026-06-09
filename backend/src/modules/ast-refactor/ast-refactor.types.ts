export interface MoveFunctionRequest{
    workspaceId: string;
    functionName: string;
    sourceFile: string;
    targetFile: string;
}

export interface astRefactorService{
    sourceBefore: string;
    sourceAfter: string;

    targetBefore: string;
    targetAfter: string;
}


export interface RenameFunctionPreview{
    filePath: string;
    before: string;
    after: string;
}

export interface RenameFunctionResult{
    affectedFiles: RenameFunctionPreview[];
    
}