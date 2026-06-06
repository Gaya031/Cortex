export enum GraphNodeType{
    FILE = "FILE",
    FUNCTION = "FUNCTION",
    COMPONENT = "COMPONENT",
    CLASS = "CLASS",
    METHOD = "METHOD",
    EXTERNAL_MODULE = "EXTERNAL_MODULE",
}

export enum GraphRelationType{
    CONTAINS = "CONTAINS",
    IMPORTS = "IMPORTS",
    EXPORTS = "EXPORTS",
    FILE_IMPORTS_FILE = "FILE_IMPORTS_FILE"
}

export interface GraphNode{
    workspaceId: string;
    nodeId: string;
    type: GraphNodeType;
    name: string;
    filePath: string;
}

export interface GraphEdge{
    workspaceId: string;
    source: string;
    target: string;
    relation: GraphRelationType;
}

