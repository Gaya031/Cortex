import { api } from "@/store/api";

export interface RenameFunctionResult {
  renamed: string;
  newName: string;
  filesUpdated: number;
}

export interface DiffFile {
  filePath: string;
  before: string;
  after: string;
}

export interface RenamePreview {
  affectedFiles: DiffFile[];
}

export interface MovePreview {
  source: DiffFile;
  target: DiffFile;
}

export interface MoveFunctionResult {
  success: boolean;
  movedFunction: string;
  sourceFile: string;
  targetFile: string;
}

export const astRefactorApi = {
  async previewRenameFunction(
    workspaceId: string,
    oldName: string,
    newName: string,
  ): Promise<RenamePreview> {
    const res = await api.post("/diff-preview/rename-function", {
      workspaceId,
      oldName,
      newName,
    });

    return res.data.result;
  },

  async renameFunction(
    workspaceId: string,
    oldName: string,
    newName: string,
  ): Promise<RenameFunctionResult> {
    const res = await api.post("/ast-refactor/rename-function", {
      workspaceId,
      oldName,
      newName,
    });

    return res.data.result;
  },

  async previewMoveFunction(
    workspaceId: string,
    functionName: string,
    sourceFile: string,
    targetFile: string,
  ): Promise<MovePreview> {
    const res = await api.post("/diff-preview/move-function", {
      workspaceId,
      functionName,
      sourceFile,
      targetFile,
    });

    return res.data.result;
  },

  async moveFunction(
    workspaceId: string,
    functionName: string,
    sourceFile: string,
    targetFile: string,
  ): Promise<MoveFunctionResult> {
    const res = await api.post("/ast-refactor/move-function", {
      workspaceId,
      functionName,
      sourceFile,
      targetFile,
    });

    return res.data.refactor;
  },
};
