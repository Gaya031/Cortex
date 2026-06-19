import { Request, Response } from "express";
import { ValidationService } from "./validation.service.js";

export class ValidationController {
  private readonly validationService = new ValidationService();

  validateChangeSet = async (req: Request, res: Response) => {
    const { workspaceId, changeSet } = req.body;
    const result = await this.validationService.validateChangeSet(
      workspaceId,
      changeSet,
    );

    return res.status(200).json({
      success: true,
      result,
    });
  };
}
