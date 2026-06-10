export interface ProjectFile{
    workspaceId: string;
    path: string;
    extension: string;
    language: string;
    hash: string;
    size: number;
    content?: string;
}

