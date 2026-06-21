import { api } from "@/store/api";
import {
  AuthResult,
  CreateWorkspacePayload,
  Workspace,
} from "@/types/workspace.types";

export const workspaceApi = {
  async getAll(): Promise<Workspace[]> {
    const res = await api.get("/workspaces");
    return res.data.data ?? [];
  },

  async getById(workspaceId: string): Promise<Workspace> {
    const res = await api.get(`/workspaces/${workspaceId}`);
    return res.data.data;
  },

  async create(
    payload: CreateWorkspacePayload,
  ): Promise<Workspace> {
    const res = await api.post("/workspaces", payload);
    return res.data.data;
  },

  async browseFolder(): Promise<{ canceled: boolean; path?: string }> {
    const res = await api.get("/workspaces/browse-folder");
    return res.data.data;
  },

  async login(
    email: string,
    password: string,
  ): Promise<AuthResult> {
    const res = await api.post("/auth/login", {
      email,
      password,
    });
    return res.data.result;
  },

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<AuthResult> {
    const res = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    return res.data.result;
  },

  async delete(workspaceId: string): Promise<void> {
    await api.delete(`/workspaces/${workspaceId}`);
  },
};
