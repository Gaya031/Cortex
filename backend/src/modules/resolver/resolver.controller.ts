import { Request, Response } from "express";
import { ResolverService } from "./resolver.service.js";

const resolverService =
  new ResolverService();

export class ResolverController {
  async resolveFile(
    req: Request,
    res: Response
  ) {
    const {
      workspaceId,
      currentFilePath,
      importPath,
    } = req.body;

    const resolvedFile =
      await resolverService.resolveFile(
        workspaceId,
        currentFilePath,
        importPath
      );

    return res.status(200).json({
      success: true,
      data: resolvedFile,
    });
  }
}