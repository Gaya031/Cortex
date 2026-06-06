export interface TransformationContext {
  file: string;
  functions: {
    name: string;
    parameters: any[];
    returnType: string;
    calls?: string[];
  };
  components: string[];
  classes: {
    name: string;
  }[];
  imports: string[];
  exports: string[];
  dependencies: string[];
}

export interface TransformationFunction{
    name: string;
    parameters?: any[];
    returnType?: string;
    calls?: string[];
    parentChunk?: string;
    content: string;
    startLine: number;
    endLine: number;
}