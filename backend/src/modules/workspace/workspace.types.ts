export enum WorkspaceStatus{
    CREATED = "CREATED",
    PROCESSING = "PROCESSING",
    READY = "READY",
    FAILED = "FAILED"
}

export interface CreateWorkspaceDto{
    userId: string;
    name: string;
    localPath: string;
    description?: string;
    status?: WorkspaceStatus;
}

export interface Workspace{
    userId: string;
    name: string;
    localPath: string;
    status?: WorkspaceStatus;
}
