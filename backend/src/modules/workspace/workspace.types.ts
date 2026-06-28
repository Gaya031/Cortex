export enum WorkspaceStatus{
    CREATED = "CREATED",
    PROCESSING = "PROCESSING",
    READY = "READY",
    FAILED = "FAILED"
}

export enum WorkspaceSourceType {
    LOCAL = "local",
    GITHUB = "github",
}

export interface CreateWorkspaceDto{
    userId: string;
    name: string;
    description?: string;
    status?: WorkspaceStatus;
    sourceType?: WorkspaceSourceType;
    localPath?: string;
    githubOwner?: string;
    githubRepo?: string;
    githubBranch?: string;
    githubUrl?: string;
    githubToken?: string;
}

export interface Workspace{
    userId: string;
    name: string;
    sourceType?: WorkspaceSourceType;
    localPath?: string;
    githubOwner?: string;
    githubRepo?: string;
    githubBranch?: string;
    githubToken?: string;
    status?: WorkspaceStatus;
}
