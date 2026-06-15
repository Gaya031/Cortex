export enum WorkspaceStatus{
    CREATED = "CREATED",
    PROCESSING = "PROCESSING",
    READY = "READY",
    FAILED = "FAILED"
}

export interface CreateWorkspaceDto{
    userId: string;
    name: string;
    description?: string;
}

export interface Workspace{
    userId: string;
    name: string;
    localPath: string;
}
