import { Elysia } from "elysia";
import { AppError } from "@/lib/errors";

export const errorHandler = new Elysia({ name: "error-handler" }).onError(({ error, set }) => {
  if (error instanceof AppError) {
    set.status = error.statusCode;
    return { success: false, error: { code: error.code, message: error.message, details: error.details } };
  }
  if ((error as Error & { validator?: unknown }).validator) {
    set.status = 422;
    return { success: false, error: { code: "VALIDATION", message: (error as Error).message } };
  }
  set.status = 500;
  return { success: false, error: { code: "INTERNAL", message: (error as Error).message ?? "Internal error" } };
});
