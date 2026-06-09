export interface ChangeSet {
  createFiles: string[];
  moveFunctions: MoveFunctionOperation[];
  renameFunctions: RenameFunctionOperation[];
  updateImports: {
    file: string;
    reason: string;
  }[];
  warnings: string[];
}

export interface MoveFunctionOperation {
  function: string;
  from: string;
  to: string;
}

export interface RenameFunctionOperation {
  oldName: string;
  newName: string;
}
