import type { CreateQuoteInput, Quote, UpdateQuoteInput } from "@/lib/types/quote.types";
import type { PaginatedResult, PaginationInput } from "@/lib/types/common.types";

export interface IQuoteRepository {
  findById(id: string): Promise<Quote | null>;
  list(pagination: PaginationInput): Promise<PaginatedResult<Quote>>;
  create(input: CreateQuoteInput): Promise<Quote>;
  update(id: string, input: UpdateQuoteInput): Promise<Quote>;
  softDelete(id: string): Promise<void>;
}
