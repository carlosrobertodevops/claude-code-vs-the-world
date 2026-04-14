export type Role = "MANAGER" | "EMPLOYEE";
export type OrderStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "DELIVERED" | "CANCELLED";
export type QueueStatus = "WAITING" | "IN_SERVICE" | "DONE";
export type ContractStatus = "PENDING" | "SIGNED" | "CANCELLED";
export type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED";

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export type ApiResponse<T> =
  | { success: true; data: T; meta?: PaginationMeta }
  | { success: false; error: ApiError };
