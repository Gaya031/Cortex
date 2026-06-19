export interface FlowNode {
  id: string;
  name: string;
  filePath: string;
}

export interface FlowExplanation {
  target: string;
  totalPaths: number;
  impactScore: number;
  paths: {
    cycle: boolean;
    path: {
      id: string;
      name: string;
      filePath: string;
    }[];
  }[];
}

export interface FlowPath {
  path: FlowNode[];
  cycle: boolean;
}
