import type { PaginationInput, PaginationMeta } from "@/lib/types/common.types";

export function paginate(input: PaginationInput | undefined) {
  const page = Math.max(1, input?.page ?? 1);
  const limit = Math.min(100, Math.max(1, input?.limit ?? 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
