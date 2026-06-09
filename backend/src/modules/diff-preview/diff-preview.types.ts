export interface FileDiff{
    filePath: string;
    before: string;
    after: string;
}

export interface MoveFunctionPreview{
    source: FileDiff;
    target: FileDiff;
}

