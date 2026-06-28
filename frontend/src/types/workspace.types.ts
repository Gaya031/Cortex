export type WorkspaceStatus =
  | "CREATED"
  | "PROCESSING"
  | "READY"
  | "FAILED";

export type WorkspaceSourceType = "local" | "github";

export interface Workspace {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  sourceType?: WorkspaceSourceType;
  localPath?: string;
  githubOwner?: string;
  githubRepo?: string;
  githubBranch?: string;
  status?: WorkspaceStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
  sourceType?: WorkspaceSourceType;
  localPath?: string;
  githubUrl?: string;
  githubOwner?: string;
  githubRepo?: string;
  githubBranch?: string;
  githubToken?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

export interface GithubRepoSummary {
  fullName: string;
  defaultBranch: string;
  private: boolean;
}
