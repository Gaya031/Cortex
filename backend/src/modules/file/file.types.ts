export interface ProjectFile{
    workspaceId: string;
    path: string;
    extension: string;
    hash: string;
    size: number;
    content?: string;
}

