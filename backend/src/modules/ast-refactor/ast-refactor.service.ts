import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { generate } from "@babel/generator";
import * as t from "@babel/types";
import type { NodePath } from "@babel/traverse";
import path from "path";

import { WorkspaceContentService } from "../../shared/workspace-content/workspace-content.service.js";

interface MoveFunctionResult {
  sourceBefore: string;
  sourceAfter: string;
  targetBefore: string;
  targetAfter: string;
}

export class AstRefactorService {
  private readonly contentService = new WorkspaceContentService();

  private buildImportPath(sourceFile: string, targetFile: string) {
    const relative = path.relative(path.dirname(sourceFile), targetFile);
    return relative
      .replace(/\\/g, "/")
      .replace(/\.(ts|tsx|js|jsx)$/, "")
      .startsWith(".")
      ? relative.replace(/\\/g, "/").replace(/\.(ts|tsx|js|jsx)$/, "")
      : `./${relative.replace(/\\/g, "/").replace(/\.(ts|tsx|js|jsx)$/, "")}`;
  }

  private addImport(ast: t.File, functionName: string, importPath: string) {
    const importNode = t.importDeclaration(
      [
        t.importSpecifier(
          t.identifier(functionName),
          t.identifier(functionName),
        ),
      ],
      t.stringLiteral(importPath),
    );
    ast.program.body.unshift(importNode);
  }

  private async buildMoveFunctionResult(
    workspaceId: string,
    functionName: string,
    sourceFile: string,
    targetFile: string,
  ): Promise<MoveFunctionResult> {
    const sourceBefore = await this.contentService.readFile(
      workspaceId,
      sourceFile,
    );

    const sourceAst = parse(sourceBefore, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });

    let extracted: t.FunctionDeclaration | null = null;

    const traverseFn = (traverse as any).default || traverse;

    traverseFn(sourceAst, {
      FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
        if (path.node.id?.name !== functionName) return;

        extracted = t.cloneNode(path.node, true);

        path.remove();
      },
      VariableDeclarator(path: NodePath<t.VariableDeclarator>) {
        if (
          path.node.id.type === "Identifier" &&
          path.node.id.name === functionName &&
          path.node.init &&
          (t.isArrowFunctionExpression(path.node.init) ||
            t.isFunctionExpression(path.node.init))
        ) {
          extracted = t.cloneNode(path.parentPath.node as any, true);
          path.parentPath.remove();
        }
      },
    });

    if (!extracted) {
      throw new Error(`Function "${functionName}" not found in ${sourceFile}`);
    }

    const importPath = this.buildImportPath(sourceFile, targetFile);

    this.addImport(sourceAst, functionName, importPath);

    const exportedFunction = t.exportNamedDeclaration(extracted);
    const sourceAfter = generate(sourceAst, {
      retainLines: true,
    }).code;

    let targetBefore = "";
    let targetAst: t.File;

    try {
      targetBefore = await this.contentService.readFile(
        workspaceId,
        targetFile,
      );
      targetAst = parse(targetBefore, {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      });
    } catch {
      targetAst = t.file(t.program([]));
    }

    targetAst.program.body.push(exportedFunction);

    const targetAfter = generate(targetAst, {
      retainLines: true,
    }).code;

    return {
      sourceBefore,
      sourceAfter,
      targetBefore,
      targetAfter,
    };
  }

  private async getWorkspaceFiles(workspaceId: string) {
    const files = await this.contentService.listSourceFilePaths(workspaceId);

    return {
      files: files.filter(
        (file) =>
          file.endsWith(".ts") ||
          file.endsWith(".tsx") ||
          file.endsWith(".js") ||
          file.endsWith(".jsx"),
      ),
    };
  }

  private async updateImportsForMovedFunction(
    workspaceId: string,
    functionName: string,
    oldFile: string,
    newFile: string,
  ) {
    const { files } = await this.getWorkspaceFiles(workspaceId);
    const buildImportPath = this.buildImportPath.bind(this);

    for (const relativeFile of files) {
      if (relativeFile === newFile) {
        continue;
      }

      const code = await this.contentService.readFile(
        workspaceId,
        relativeFile,
      );

      const ast = parse(code, {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      });

      let changed = false;

      const oldImportPath = buildImportPath(relativeFile, oldFile);
      const newImportPath = buildImportPath(relativeFile, newFile);

      const traverseFn = (traverse as any).default || traverse;

      traverseFn(ast, {
        ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
          const importsFunction = path.node.specifiers.some(
            (
              specifier:
                | t.ImportSpecifier
                | t.ImportDefaultSpecifier
                | t.ImportNamespaceSpecifier,
            ) =>
              t.isImportSpecifier(specifier) &&
              t.isIdentifier(specifier.imported) &&
              specifier.imported.name === functionName,
          );

          if (!importsFunction) {
            return;
          }

          if (path.node.source.value !== oldImportPath) {
            return;
          }

          path.node.source.value = newImportPath;

          changed = true;
        },
      });

      if (changed) {
        await this.contentService.writeFile(
          workspaceId,
          relativeFile,
          generate(ast, {
            retainLines: true,
          }).code,
        );
      }
    }
  }

  async previewMoveFunction(
    workspaceId: string,
    functionName: string,
    sourceFile: string,
    targetFile: string,
  ) {
    const result = await this.buildMoveFunctionResult(
      workspaceId,
      functionName,
      sourceFile,
      targetFile,
    );

    return {
      source: {
        filePath: sourceFile,
        before: result.sourceBefore,
        after: result.sourceAfter,
      },
      target: {
        filePath: targetFile,
        before: result.targetBefore,
        after: result.targetAfter,
      },
    };
  }

  async moveFunction(
    workspaceId: string,
    functionName: string,
    sourceFile: string,
    targetFile: string,
  ) {
    const result = await this.buildMoveFunctionResult(
      workspaceId,
      functionName,
      sourceFile,
      targetFile,
    );

    await this.contentService.writeFile(
      workspaceId,
      sourceFile,
      result.sourceAfter,
    );
    await this.contentService.writeFile(
      workspaceId,
      targetFile,
      result.targetAfter,
    );
    await this.updateImportsForMovedFunction(
      workspaceId,
      functionName,
      sourceFile,
      targetFile,
    );

    return {
      success: true,
      movedFunction: functionName,
      sourceFile,
      targetFile,
    };
  }

  async previewRenameFunction(
    workspaceId: string,
    oldName: string,
    newName: string,
  ) {
    const { files } = await this.getWorkspaceFiles(workspaceId);

    const affectedFiles = [];

    for (const filePath of files) {
      const before = await this.contentService.readFile(workspaceId, filePath);

      const ast = parse(before, {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      });

      const traverseFn = (traverse as any).default || traverse;

      traverseFn(ast, {
        FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
          if (path.node.id?.name === oldName) {
            path.node.id.name = newName;
          }
        },
        CallExpression(path: NodePath<t.CallExpression>) {
          if (
            t.isIdentifier(path.node.callee) &&
            path.node.callee.name === oldName
          ) {
            path.node.callee.name = newName;
          }
        },

        ImportSpecifier(path: NodePath<t.ImportSpecifier>) {
          if (
            t.isIdentifier(path.node.imported) &&
            path.node.imported.name === oldName
          ) {
            path.node.imported.name = newName;
          }

          if (
            t.isIdentifier(path.node.local) &&
            path.node.local.name === oldName
          ) {
            path.node.local.name = newName;
          }
        },

        ExportSpecifier(path: NodePath<t.ExportSpecifier>) {
          if (
            t.isIdentifier(path.node.local) &&
            path.node.local.name === oldName
          ) {
            path.node.local.name = newName;
          }
        },

        VariableDeclarator(path: NodePath<t.VariableDeclarator>) {
          if (t.isIdentifier(path.node.id) && path.node.id.name === oldName) {
            path.node.id.name = newName;
          }
        },
      });
      const after = generate(ast).code;

      if (before !== after) {
        affectedFiles.push({
          filePath,
          before,
          after,
        });
      }
    }

    return { affectedFiles };
  }

  async renameFunction(workspaceId: string, oldName: string, newName: string) {
    const preview = await this.previewRenameFunction(
      workspaceId,
      oldName,
      newName,
    );

    for (const file of preview.affectedFiles) {
      await this.contentService.writeFile(
        workspaceId,
        file.filePath,
        file.after,
      );
    }
    return {
      renamed: oldName,
      newName,
      filesUpdated: preview.affectedFiles.length,
    };
  }
}
