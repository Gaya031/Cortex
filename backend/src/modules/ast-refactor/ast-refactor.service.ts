import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { generate } from "@babel/generator";
import * as t from "@babel/types";
import type { NodePath } from "@babel/traverse";
import path from "path";

import { WorkspaceRepository } from "../workspace/workspace.repository.js";
import { FilesystemService } from "../../shared/filesystem/filesystem.service.js";

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
    console.log({
      workspace,
      sourceFile,
      targetFile,
    });
    const sourcePath = path.join(workspace.localPath, sourceFile);
    const targetPath = path.join(workspace.localPath, targetFile);
    const sourceCode = await this.filesystemService.readFile(sourcePath);

    const ast = parse(sourceCode, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });

    let extracted: t.FunctionDeclaration | null = null;
    const traverseFn = (traverse as any).default || traverse;
    traverseFn(ast, {
      FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
        if (path.node.id?.name !== functionName) return;
        extracted = t.cloneNode(path.node, true);
        path.remove();
      },
    });

    if (!extracted) {
      throw new Error(`Function "${functionName} not found in ${sourceFile}`);
    }

    const importPath = this.buildImportPath(sourceFile, targetFile);
    this.addImport(ast, functionName, importPath);

    const exportedFunction = t.exportNamedDeclaration(extracted);
    const updatedSourceCode = generate(ast, { retainLines: true }).code;

    await this.filesystemService.writeFile(sourcePath, updatedSourceCode);
    let targetAst: t.File;

    const targetExists = await this.filesystemService.exists(targetPath);
    if (targetExists) {
      const targetCode = await this.filesystemService.readFile(targetPath);
      targetAst = parse(targetCode, {
        sourceType: "module",
        plugins: ["typescript", "jsx"],
      });
    } else {
      targetAst = t.file(t.program([]));
      targetAst.program.body.push(exportedFunction);
      const updatedTargetCode = generate(targetAst, { retainLines: true }).code;
      await this.filesystemService.writeFile(targetPath, updatedTargetCode);
    }
    return {
      success: true,
      movedFunction: functionName,
      sourceFile,
      targetFile,
    };
  }
}
