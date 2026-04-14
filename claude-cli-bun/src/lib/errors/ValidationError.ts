import { AppError } from "./AppError";

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super("VALIDATION", message, 422, details);
    this.name = "ValidationError";
  }
}
