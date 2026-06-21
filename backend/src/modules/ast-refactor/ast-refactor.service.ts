import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { generate } from "@babel/generator";
import * as t from "@babel/types";
import type { NodePath } from "@babel/traverse";
import path from "path";

import { WorkspaceRepository } from "../workspace/workspace.repository.js";
import { FilesystemService } from "../../shared/filesystem/filesystem.service.js";

interface MoveFunctionResult {
  sourceBefore: string;
  sourceAfter: string;
  targetBefore: string;
  targetAfter: string;
}

export class AstRefactorService {
  private readonly workspaceRepository = new WorkspaceRepository();
  private readonly filesystemService = new FilesystemService();

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
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    const sourcePath = path.join(workspace.localPath, sourceFile);

    const targetPath = path.join(workspace.localPath, targetFile);

    const sourceBefore = await this.filesystemService.readFile(sourcePath);

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

    const targetExists = await this.filesystemService.exists(targetPath);

    let targetBefore = "";
    let targetAst: t.File;

    if (targetExists) {
      targetBefore = await this.filesystemService.readFile(targetPath);

      targetAst = parse(targetBefore, {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      });
    } else {
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
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) throw new Error("Workspace not found");
    const files = await this.filesystemService.getAllFiles(workspace.localPath);

    return {
      workspace,
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
    const { workspace, files } = await this.getWorkspaceFiles(workspaceId);

    const buildImportPath = this.buildImportPath.bind(this);

    const filesystemService = this.filesystemService;

    for (const filePath of files) {
      const relativeFile = filesystemService.getRelativePath(
        workspace.localPath,
        filePath,
      );

      // Skip the destination file itself
      if (relativeFile === newFile) {
        continue;
      }

      const code = await filesystemService.readFile(filePath);

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

          // Only rewrite imports that actually
          // come from the old file.
          if (path.node.source.value !== oldImportPath) {
            return;
          }

          path.node.source.value = newImportPath;

          changed = true;
        },
      });

      if (changed) {
        await filesystemService.writeFile(
          filePath,
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
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    const result = await this.buildMoveFunctionResult(
      workspaceId,
      functionName,
      sourceFile,
      targetFile,
    );

    const sourcePath = path.join(workspace.localPath, sourceFile);
    const targetPath = path.join(workspace.localPath, targetFile);

    await this.filesystemService.writeFile(sourcePath, result.sourceAfter);
    await this.filesystemService.writeFile(targetPath, result.targetAfter);
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
    const { workspace, files } = await this.getWorkspaceFiles(workspaceId);

    const affectedFiles = [];

    for (const filePath of files) {
      const before = await this.filesystemService.readFile(filePath);

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
          filePath: this.filesystemService.getRelativePath(
            workspace.localPath,
            filePath,
          ),
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
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace) throw new Error("Workspace not found");

    for (const file of preview.affectedFiles) {
      const absolutePath = path.join(workspace.localPath, file.filePath);
      await this.filesystemService.writeFile(absolutePath, file.after);
    }
    return {
      renamed: oldName,
      newName,
      filesUpdated: preview.affectedFiles.length,
    };
  }
}
