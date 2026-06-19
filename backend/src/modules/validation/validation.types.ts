export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ChangeSetValidationResult extends ValidationResult {
    renameValidations: ValidationResult[];
    moveValidation: ValidationResult[];
}


