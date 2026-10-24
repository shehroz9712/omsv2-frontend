import { ValidationErrorItem } from "@/types/api";

/**
 * Standardized client API error parsed directly from backend Laravel-style envelope.
 */
export class ApiError extends Error {
  public statusCode: number;
  public errors: ValidationErrorItem[];

  constructor(message: string, statusCode: number = 500, errors: ValidationErrorItem[] = []) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }

  /**
   * Helper to retrieve a single error message for a specific field name.
   */
  public getFieldError(fieldName: string): string | undefined {
    const found = this.errors.find((e) => e.field === fieldName);
    return found?.message;
  }
}
