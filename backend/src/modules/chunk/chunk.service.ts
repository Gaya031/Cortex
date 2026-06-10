import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import { Chunk, ChunkType } from "./chunk.types.js";
import {EmbeddingStatus} from "../embedding/embedding.types.js";
import * as t from "@babel/types";

const traverse = traverseModule.default;

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
      if (
        current.type === "CallExpression" &&
        current.callee?.type === "Identifier"
      ) {
        calls.add(current.callee.name);
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
          type: param.typeAnnotation?.typeAnnotation?.type ?? "unknown",
        };
      }
      return {
        name: "unnknown",
        type: "unknown",
      };
    });
  }

  private extractReturnType(node: any): string | undefined {
    return node.returnType?.typeAnnotation?.type;
  }

  generateChunks(workspaceId: string, filePath: string, code: string): Chunk[] {
    const extractFunctionCalls = this.extractFunctionCalls.bind(this);
    const extractParameters = this.extractParameters.bind(this);
    const extractreturnType = this.extractReturnType.bind(this);

    const chunks: Chunk[] = [];
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });

    const imports: string[] = [];
    const exports: string[] = [];

    traverse(ast, {
      ImportDeclaration(path) {
        imports.push(path.node.source.value);
      },
      ExportNamedDeclaration(path) {
        const declaration = path.node.declaration;
        if (declaration && declaration.type === "FunctionDeclaration") {
          exports.push(declaration.id?.name || "anonymous");
        }
      },
      ExportDefaultDeclaration(path) {
        if (path.node.declaration.type === "Identifier") {
          exports.push(path.node.declaration.name);
        }
      },
    });

    traverse(ast, {
      FunctionDeclaration(path) {
        const calls = extractFunctionCalls(path.node);
        const parameters = extractParameters(path.node.params);
        const returnType = extractreturnType(path.node);

        chunks.push({
          workspaceId,
          filePath,
          name: path.node.id?.name || "anonymous",
          type: ChunkType.FUNCTION,
          content: code.slice(path.node.start!, path.node.end!),
          startLine: path.node.loc?.start.line ?? 0,
          endLine: path.node.loc?.end.line ?? 0,
          imports,
          exports,
          dependencies: [],
          calls,
          calledBy: [],
          parameters,
          returnType,
          parentChunk: undefined,
          resolvedImports: [],
          embeddingStatus: EmbeddingStatus.PENDING,
        });
      },
      VariableDeclarator(path) {
        const init = path.node.init;
        if (
          !init ||
          (init.type !== "ArrowFunctionExpression" &&
            init.type !== "FunctionExpression")
        ) {
          return;
        }
        const calls = extractFunctionCalls(init);
        const parameters = extractParameters(init.params);
        const returnType = extractreturnType(init);

        const name =
          path.node.id.type === "Identifier" ? path.node.id.name : "anonymous";
        const isComponent = /^[A-Z]/.test(name);
        chunks.push({
          workspaceId,
          filePath,
          name,
          type: isComponent ? ChunkType.COMPONENT : ChunkType.FUNCTION,
          content: code.slice(path.node.start!, path.node.end!),
          startLine: path.node.loc?.start.line ?? 0,
          endLine: path.node.loc?.end.line ?? 0,
          imports,
          exports,
          dependencies: [],
          calls,
          calledBy: [],
          parameters,
          returnType,
          resolvedImports: [],
          embeddingStatus: EmbeddingStatus.PENDING,
        });
      },
      ClassDeclaration(path) {
        chunks.push({
          workspaceId,
          filePath,
          name: path.node.id?.name ?? "AnonymousClass",
          type: ChunkType.CLASS,
          content: code.slice(path.node.start!, path.node.end!),
          startLine: path.node.loc?.start.line ?? 0,
          endLine: path.node.loc?.end.line ?? 0,
          imports,
          exports,
          dependencies: [],
          calls: [],
          calledBy: [],
          resolvedImports: [],
          embeddingStatus: EmbeddingStatus.PENDING,
        });
        path.node.body.body.forEach((member) => {
          if (member.type !== "ClassMethod") return;
          const calls = extractFunctionCalls(member);
          const parameters = extractParameters(member.params);
          const returnType = extractreturnType(member);
          chunks.push({
            workspaceId,
            filePath,
            name:
              member.key.type === "Identifier" ? member.key.name : "anonymous",
            type: ChunkType.METHOD,
            content: code.slice(member.start!, member.end!),
            startLine: member.loc?.start.line ?? 0,
            endLine: member.loc?.end.line ?? 0,
            imports,
            exports,
            dependencies: [],
            calls,
            calledBy: [],
            parameters,
            returnType,
            parentChunk: path.node.id?.name,
            resolvedImports: [],
            embeddingStatus: EmbeddingStatus.PENDING,
          });
        });
      },
    });
    return chunks;
  }
}
