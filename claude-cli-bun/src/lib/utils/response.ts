import type { ApiResponse, PaginationMeta } from "@/lib/types/common.types";
import { AppError } from "@/lib/errors";

export function success<T>(data: T, meta?: PaginationMeta): ApiResponse<T> {
  return meta ? { success: true, data, meta } : { success: true, data };
}

export function error(code: string, message: string, details?: unknown): ApiResponse<never> {
  return { success: false, error: { code, message, details } };
}

export function fromAppError(err: AppError): ApiResponse<never> {
  return error(err.code, err.message, err.details);
}
