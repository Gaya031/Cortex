export interface ProjectFile {
  _id?: string;
  workspaceId: string;
  path: string;
  extension: string;
  language: string;
  hash?: string;
  size: number;
  content?: string;
}

export interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  language?: string;
  extension?: string;
  size?: number;
  children: FileTreeNode[];
}

export interface EditorTab {
  path: string;
  language: string;
  content: string;
  originalContent: string;
  dirty: boolean;
}
