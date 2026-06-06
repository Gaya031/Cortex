export interface ParsedImport {
  source: string;
}

export interface ParsedFunction {
  name: string;
  startLine?: number;
  endLine?: number;
}

export interface ParsedClass {
  name: string;
  methods: string[];
}

export interface ParsedExport {
  name: string;
}

export interface ParsedComponent {
  name: string;
}

export interface ParsedInterface {
  name: string;
}

export interface ParsedType {
  name: string;
}

export interface ParsedFile {
  imports: ParsedImport[];
  exports: ParsedExport[];
  functions: ParsedFunction[];
  components: ParsedComponent[];
  interfaces: ParsedInterface[];
  types: ParsedType[];
  classes: ParsedClass[];
}
