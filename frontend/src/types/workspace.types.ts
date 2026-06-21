export type WorkspaceStatus =
  | "CREATED"
  | "PROCESSING"
  | "READY"
  | "FAILED";

export interface Workspace {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  localPath: string;
  status?: WorkspaceStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWorkspacePayload {
  name: string;
  localPath: string;
  description?: string;
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
