export enum WorkspaceStatus{
    CREATED = "CREATED",
    PROCESSING = "PROCESSING",
    READY = "READY",
    FAILED = "FAILED"
}

export interface CreateWorkspaceDto{
    name: string;
    description?: string;
}

export interface Workspace{
    name: string;
    localPath: string;
}
