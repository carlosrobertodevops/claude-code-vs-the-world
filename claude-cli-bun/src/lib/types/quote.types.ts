import type { QuoteStatus } from "./common.types";

export interface Quote {
  id: string;
  customerId: string;
  vehicleId: string | null;
  status: QuoteStatus;
  total: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  serviceTypeId: string | null;
  productId: string | null;
  description: string;
  qty: number;
  unitPrice: string;
}

export interface CreateQuoteInput {
  customerId: string;
  vehicleId?: string;
  notes?: string;
  items: Array<Omit<QuoteItem, "id" | "quoteId">>;
}

export interface UpdateQuoteInput {
  status?: QuoteStatus;
  notes?: string;
  items?: Array<Omit<QuoteItem, "id" | "quoteId">>;
}
