import { AppError } from "./AppError";

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super("NOT_FOUND", `${resource}${id ? ` (${id})` : ""} not found`, 404);
    this.name = "NotFoundError";
  }
}
