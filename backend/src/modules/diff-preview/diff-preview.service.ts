import { AstRefactorService } from "../ast-refactor/ast-refactor.service.js";

export class DiffPreviewService {
  private readonly astRefactorService = new AstRefactorService();

  async previewMoveFunction(
    workspaceId: string,
    functionName: string,
    sourceFile: string,
    targetFile: string,
  ) {
    return this.astRefactorService.previewMoveFunction(
      workspaceId,
      functionName,
      sourceFile,
      targetFile,
    );
  }
}
