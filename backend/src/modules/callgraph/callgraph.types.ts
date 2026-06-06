export interface CallGraphEdge{
    from: string;
    to: string;
}

export interface CallGraphNode{
    name: string;
    filePath: string;
    type: string;
}

