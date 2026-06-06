export enum DecisionImportance {
  LOW = 1,
  MEDIUM = 3,
  HIGH = 5,
}

export interface Decision {
  workspaceId: string;
  title: string;
  reasoning: string;
  importance: string;
  createdAt: Date;
}

export interface DecisionConflict {
  conflict: boolean;
  conflictDecision?: {
    id: string;
    title: string;
  };
}
