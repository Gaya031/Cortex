import {
  ChangeSet,
  MoveFunctionOperation,
  RenameFunctionOperation,
} from "../changeset/changeset.types.js";

import { ChunkRepository } from "../chunk/chunk.repository.js";
import { FileRepository } from "../file/file.repository.js";

import {
  ChangeSetValidationResult,
  ValidationResult,
} from "./validation.types.js";

import { Chunk, ChunkType } from "../chunk/chunk.types.js";
import { CallgraphService } from "../callgraph/callgraph.service.js";
import { buildChunkNodeId } from "../../shared/utils/chunk-node.util.js";

export class ValidationService {
  private readonly chunkRepository = new ChunkRepository();
  private readonly fileRepository = new FileRepository();
  private readonly callgraphService = new CallgraphService();

  private isMovableChunk(chunk: Chunk) {
    return (
      chunk.type === ChunkType.FUNCTION ||
      chunk.type === ChunkType.COMPONENT ||
      chunk.type === ChunkType.METHOD
    );
  }

  async validateRenameFunction(
    workspaceId: string,
    operation: RenameFunctionOperation,
    chunks: Chunk[],
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (operation.oldName === operation.newName) {
      errors.push(
        "New function name must be different from the old function name.",
      );
    }

    const oldFunction = chunks.find(
      (chunk) => chunk.name === operation.oldName,
    );

    if (!oldFunction) {
      errors.push(`Function "${operation.oldName}" does not exist.`);
    }

    const newFunctionExists = chunks.some(
      (chunk) => chunk.name === operation.newName,
    );

    if (newFunctionExists) {
      errors.push(`Function "${operation.newName}" already exists.`);
    }

    if (oldFunction) {
      try {
        const functionId = buildChunkNodeId(oldFunction);

        const impact = await this.callgraphService.getFunctionImpact(
          workspaceId,
          functionId,
        );

        if (impact.impactScore > 0) {
          warnings.push(
            `Renaming "${operation.oldName}" affects ${impact.impactScore} dependent functions.`,
          );
        }
      } catch {
        // Ignore impact failures
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async validateMoveFunction(
    workspaceId: string,
    operation: MoveFunctionOperation,
    chunks: Chunk[],
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (operation.from === operation.to) {
      errors.push(
        "Source file and target file cannot be the same.",
      );
    }

    const sourceFile = await this.fileRepository.findByPath(
      workspaceId,
      operation.from,
    );

    if (!sourceFile) {
      errors.push(`Source file "${operation.from}" not found.`);
    }

    const targetFile = await this.fileRepository.findByPath(
      workspaceId,
      operation.to,
    );

    if (!targetFile) {
      warnings.push(
        `Target file "${operation.to}" not found and may need to be created.`,
      );
    }

    const functionChunk = chunks.find(
      (chunk) =>
        chunk.name === operation.function &&
        chunk.filePath === operation.from,
    );

    if (!functionChunk) {
      errors.push(
        `Function "${operation.function}" not found in "${operation.from}".`,
      );
    }

    if (functionChunk && !this.isMovableChunk(functionChunk)) {
      errors.push(
        `"${operation.function}" is a ${functionChunk.type} and cannot be moved.`,
      );
    }

    const alreadyExistsInTarget = chunks.some(
      (chunk) =>
        chunk.filePath === operation.to &&
        chunk.name === operation.function,
    );

    if (alreadyExistsInTarget) {
      errors.push(
        `Function "${operation.function}" already exists in "${operation.to}".`,
      );
    }

    if (functionChunk) {
      try {
        const functionId = buildChunkNodeId(functionChunk);

        const impact = await this.callgraphService.getFunctionImpact(
          workspaceId,
          functionId,
        );

        if (impact.impactScore > 0) {
          warnings.push(
            `Moving "${operation.function}" affects ${impact.impactScore} dependent functions and imports may need updates.`,
          );
        }
      } catch {
        // Ignore impact failures
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async validateChangeSet(
    workspaceId: string,
    changeSet: ChangeSet,
  ): Promise<ChangeSetValidationResult> {
    const chunks =
      await this.chunkRepository.findByWorkspace(workspaceId);

    const renameValidations = await Promise.all(
      (changeSet.renameFunctions ?? []).map((rename) =>
        this.validateRenameFunction(
          workspaceId,
          rename,
          chunks,
        ),
      ),
    );

    const moveValidations = await Promise.all(
      (changeSet.moveFunctions ?? []).map((move) =>
        this.validateMoveFunction(
          workspaceId,
          move,
          chunks,
        ),
      ),
    );

    const errors = [
      ...renameValidations.flatMap((v) => v.errors),
      ...moveValidations.flatMap((v) => v.errors),
    ];

    const warnings = [
      ...renameValidations.flatMap((v) => v.warnings),
      ...moveValidations.flatMap((v) => v.warnings),
    ];

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      renameValidations,
      moveValidation: moveValidations,
    };
  }
}