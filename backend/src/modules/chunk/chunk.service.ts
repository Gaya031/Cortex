import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import generateModule from "@babel/generator";
import path from "path";
import { Chunk, ChunkType, ImportBinding } from "./chunk.types.js";
import { EmbeddingStatus } from "../embedding/embedding.types.js";
import * as t from "@babel/types";

const traverse = traverseModule.default;
const generate = generateModule.default;

const BUILTIN_CALLS = new Set([
  "useState",
  "useEffect",
  "useContext",
  "useReducer",
  "useCallback",
  "useMemo",
  "useRef",
  "useLayoutEffect",
  "useImperativeHandle",
  "useDebugValue",
  "useId",
  "useTransition",
  "useDeferredValue",
  "setTimeout",
  "setInterval",
  "clearTimeout",
  "clearInterval",
  "parseInt",
  "parseFloat",
  "isNaN",
  "isFinite",
  "console",
  "require",
  "String",
  "Number",
  "Boolean",
  "Array",
  "Object",
  "Function",
  "Promise",
  "Map",
  "Set",
  "JSON",
  "Math",
  "Date",
  "Error",
  "then",
  "catch",
  "finally",
  "map",
  "filter",
  "reduce",
  "forEach",
  "find",
  "some",
  "every",
  "push",
  "pop",
  "slice",
  "splice",
  "concat",
  "join",
  "split",
  "replace",
  "log",
  "error",
  "warn",
  "info",
  "debug",
  "bind",
  "call",
  "apply",
]);

export class ChunkService {
  private extractFunctionCalls(
    node:
      | t.FunctionDeclaration
      | t.FunctionExpression
      | t.ArrowFunctionExpression
      | t.ClassMethod,
  ): string[] {
    const calls = new Set<string>();
    const visit = (current: any) => {
      if (!current || typeof current !== "object") {
        return;
      }

      if (current.type === "CallExpression") {
        const callee = current.callee;

        if (callee?.type === "Identifier" && !BUILTIN_CALLS.has(callee.name)) {
          calls.add(callee.name);
        } else if (
          callee?.type === "MemberExpression" &&
          callee.property?.type === "Identifier" &&
          !BUILTIN_CALLS.has(callee.property.name)
        ) {
          calls.add(callee.property.name);
        } else if (
          callee?.type === "OptionalMemberExpression" &&
          callee.property?.type === "Identifier" &&
          !BUILTIN_CALLS.has(callee.property.name)
        ) {
          calls.add(callee.property.name);
        }
      }

      if (current.type === "ImportExpression") {
        calls.add("dynamicImport");
      }

      if (current.type === "JSXOpeningElement" && current.name?.type === "JSXIdentifier") {
        const name = current.name.name;
        if (/^[A-Z]/.test(name)) {
          calls.add(name);
        }
      }

      for (const key of Object.keys(current)) {
        const value = current[key];
        if (Array.isArray(value)) {
          value.forEach(visit);
        } else if (value && typeof value === "object") {
          visit(value);
        }
      }
    };

    visit(node.body);
    return [...calls];
  }

  private extractParameters(params: any[]) {
    return params.map((param) => {
      if (param.type === "Identifier") {
        return {
          name: param.name,
          type: param.typeAnnotation?.typeAnnotation
            ? generate(param.typeAnnotation.typeAnnotation).code
            : "unknown",
        };
      }
      if (param.type === "RestElement" && param.argument?.type === "Identifier") {
        return {
          name: param.argument.name,
          type: "rest",
        };
      }
      return {
        name: "unknown",
        type: "unknown",
      };
    });
  }

  private extractReturnType(node: any): string | undefined {
    if (!node.returnType?.typeAnnotation) {
      return undefined;
    }
    return generate(node.returnType.typeAnnotation).code;
  }

  private extractImportBindings(path: any): ImportBinding[] {
    const bindings: ImportBinding[] = [];
    const node = path.node;

    if (node.type !== "ImportDeclaration") {
      return bindings;
    }

    const modulePath = node.source.value;

    for (const specifier of node.specifiers) {
      if (specifier.type === "ImportDefaultSpecifier") {
        bindings.push({
          localName: specifier.local.name,
          importedName: "default",
          modulePath,
        });
      } else if (specifier.type === "ImportSpecifier") {
        bindings.push({
          localName: specifier.local.name,
          importedName:
            specifier.imported.type === "Identifier"
              ? specifier.imported.name
              : specifier.local.name,
          modulePath,
        });
      } else if (specifier.type === "ImportNamespaceSpecifier") {
        bindings.push({
          localName: specifier.local.name,
          importedName: "*",
          modulePath,
        });
      }
    }

    return bindings;
  }

  private collectExports(ast: t.File): string[] {
    const exports = new Set<string>();

    traverse(ast, {
      ExportNamedDeclaration(path) {
        const declaration = path.node.declaration;
        if (declaration) {
          if (
            declaration.type === "FunctionDeclaration" ||
            declaration.type === "ClassDeclaration" ||
            declaration.type === "TSInterfaceDeclaration" ||
            declaration.type === "TSTypeAliasDeclaration"
          ) {
            const name =
              "id" in declaration && declaration.id?.name
                ? declaration.id.name
                : "anonymous";
            exports.add(name);
          } else if (declaration.type === "VariableDeclaration") {
            for (const declarator of declaration.declarations) {
              if (declarator.id.type === "Identifier") {
                exports.add(declarator.id.name);
              }
            }
          }
        }

        for (const specifier of path.node.specifiers) {
          if (specifier.type === "ExportSpecifier") {
            const exportedName =
              specifier.exported.type === "Identifier"
                ? specifier.exported.name
                : specifier.local.name;
            exports.add(exportedName);
          }
        }
      },
      ExportDefaultDeclaration(path) {
        const declaration = path.node.declaration;
        if (declaration.type === "Identifier") {
          exports.add(declaration.name);
        } else if (
          declaration.type === "FunctionDeclaration" ||
          declaration.type === "ClassDeclaration"
        ) {
          exports.add(declaration.id?.name || "default");
        } else {
          exports.add("default");
        }
      },
      ExportAllDeclaration() {
        exports.add("*");
      },
    });

    return [...exports];
  }

  generateChunks(workspaceId: string, filePath: string, code: string): Chunk[] {
    const chunks: Chunk[] = [];

    let ast: t.File;
    try {
      ast = parse(code, {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      });
    } catch (error) {
      console.warn(`Parse failed for ${filePath}:`, error);
      return chunks;
    }

    const imports: string[] = [];
    const importBindings: ImportBinding[] = [];
    const exports = this.collectExports(ast);

    const extractImportBindings = this.extractImportBindings.bind(this);
    const extractFunctionCalls = this.extractFunctionCalls.bind(this);
    const extractParameters = this.extractParameters.bind(this);
    const extractReturnTypeFn = this.extractReturnType.bind(this);

    traverse(ast, {
      ImportDeclaration(path) {
        imports.push(path.node.source.value);
        importBindings.push(...extractImportBindings(path));
      },
      ExportNamedDeclaration(path) {
        if (path.node.source?.value) {
          imports.push(path.node.source.value);
        }
      },
      ExportAllDeclaration(path) {
        if (path.node.source?.value) {
          imports.push(path.node.source.value);
        }
      },
    });

    const createChunk = (
      partial: Omit<Chunk, "workspaceId" | "filePath" | "imports" | "exports" | "dependencies" | "resolvedImports" | "importBindings" | "embeddingStatus">,
    ): Chunk => ({
      workspaceId,
      filePath,
      imports,
      exports,
      dependencies: [],
      resolvedImports: [],
      importBindings,
      calledBy: [],
      embeddingStatus: EmbeddingStatus.PENDING,
      ...partial,
    });

    traverse(ast, {
      FunctionDeclaration: (path) => {
        const name = path.node.id?.name ?? "anonymous";
        const isComponent = /^[A-Z]/.test(name);

        chunks.push(
          createChunk({
            name,
            type: isComponent ? ChunkType.COMPONENT : ChunkType.FUNCTION,
            content: code.slice(path.node.start!, path.node.end!),
            startLine: path.node.loc?.start.line ?? 0,
            endLine: path.node.loc?.end.line ?? 0,
            calls: extractFunctionCalls(path.node),
            parameters: extractParameters(path.node.params),
            returnType: extractReturnTypeFn(path.node),
          }),
        );
      },

      VariableDeclarator: (path) => {
        const init = path.node.init;
        if (
          !init ||
          (init.type !== "ArrowFunctionExpression" &&
            init.type !== "FunctionExpression")
        ) {
          return;
        }

        const name =
          path.node.id.type === "Identifier" ? path.node.id.name : "anonymous";
        const isComponent = /^[A-Z]/.test(name);

        chunks.push(
          createChunk({
            name,
            type: isComponent ? ChunkType.COMPONENT : ChunkType.FUNCTION,
            content: code.slice(path.node.start!, path.node.end!),
            startLine: path.node.loc?.start.line ?? 0,
            endLine: path.node.loc?.end.line ?? 0,
            calls: extractFunctionCalls(init),
            parameters: extractParameters(init.params),
            returnType: extractReturnTypeFn(init),
          }),
        );
      },

      ClassDeclaration(path) {
        const className = path.node.id?.name ?? "AnonymousClass";

        chunks.push(
          createChunk({
            name: className,
            type: ChunkType.CLASS,
            content: code.slice(path.node.start!, path.node.end!),
            startLine: path.node.loc?.start.line ?? 0,
            endLine: path.node.loc?.end.line ?? 0,
            calls: [],
          }),
        );

        path.node.body.body.forEach((member) => {
          if (member.type !== "ClassMethod") return;

          chunks.push(
            createChunk({
              name: member.key.type === "Identifier" ? member.key.name : "anonymous",
              type: ChunkType.METHOD,
              content: code.slice(member.start!, member.end!),
              startLine: member.loc?.start.line ?? 0,
              endLine: member.loc?.end.line ?? 0,
              calls: extractFunctionCalls(member),
              parameters: extractParameters(member.params),
              returnType: extractReturnTypeFn(member),
              parentChunk: className,
            }),
          );
        });
      },

      TSInterfaceDeclaration(path) {
        chunks.push(
          createChunk({
            name: path.node.id.name,
            type: ChunkType.INTERFACE,
            content: code.slice(path.node.start!, path.node.end!),
            startLine: path.node.loc?.start.line ?? 0,
            endLine: path.node.loc?.end.line ?? 0,
            calls: [],
          }),
        );
      },

      TSTypeAliasDeclaration(path) {
        chunks.push(
          createChunk({
            name: path.node.id.name,
            type: ChunkType.TYPE,
            content: code.slice(path.node.start!, path.node.end!),
            startLine: path.node.loc?.start.line ?? 0,
            endLine: path.node.loc?.end.line ?? 0,
            calls: [],
          }),
        );
      },
    });

    const uniqueImports = [...new Set(imports)];

    if (chunks.length === 0 && uniqueImports.length > 0) {
      chunks.push(
        createChunk({
          name: path.basename(filePath).replace(/\.[^.]+$/, ""),
          type: ChunkType.MODULE,
          content: code.slice(0, Math.min(code.length, 500)),
          startLine: 1,
          endLine: 1,
          calls: [],
        }),
      );
    }

    return chunks;
  }
}
