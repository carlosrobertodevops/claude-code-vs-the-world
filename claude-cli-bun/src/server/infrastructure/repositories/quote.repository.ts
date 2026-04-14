import { count, eq } from "drizzle-orm";
import { db } from "../drizzle/client";
import { quotes, quoteItems } from "../../../../drizzle/schema";
import type { IQuoteRepository } from "@/server/domain/repositories/IQuoteRepository";
import type { CreateQuoteInput, Quote, UpdateQuoteInput } from "@/lib/types/quote.types";
import type { PaginatedResult, PaginationInput } from "@/lib/types/common.types";
import { paginate, buildPaginationMeta } from "@/lib/utils/pagination";

const mapQuote = (r: typeof quotes.$inferSelect): Quote => ({
  id: r.id, customerId: r.customerId, vehicleId: r.vehicleId, status: r.status,
  total: r.total, notes: r.notes, createdAt: r.createdAt, updatedAt: r.updatedAt,
});

export class QuoteRepository implements IQuoteRepository {
  async findById(id: string): Promise<Quote | null> {
    const [r] = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
    return r ? mapQuote(r) : null;
  }
  async list(p: PaginationInput): Promise<PaginatedResult<Quote>> {
    const { page, limit, offset } = paginate(p);
    const rows = await db.select().from(quotes).limit(limit).offset(offset);
    const [{ c } = { c: 0 }] = await db.select({ c: count() }).from(quotes);
    return { data: rows.map(mapQuote), meta: buildPaginationMeta(page, limit, Number(c)) };
  }
  async create(input: CreateQuoteInput): Promise<Quote> {
    return await db.transaction(async (tx) => {
      const total = input.items.reduce((s, it) => s + it.qty * Number(it.unitPrice), 0);
      const [q] = await tx.insert(quotes).values({
        customerId: input.customerId, vehicleId: input.vehicleId, notes: input.notes, total: total.toFixed(2),
      }).returning();
      if (!q) throw new Error("Failed to create quote");
      if (input.items.length > 0) {
        await tx.insert(quoteItems).values(input.items.map((it) => ({ ...it, quoteId: q.id })));
      }
      return mapQuote(q);
    });
  }
  async update(id: string, input: UpdateQuoteInput): Promise<Quote> {
    const [r] = await db.update(quotes).set({
      status: input.status, notes: input.notes, updatedAt: new Date(),
    }).where(eq(quotes.id, id)).returning();
    if (!r) throw new Error("Quote not found");
    return mapQuote(r);
  }
  async softDelete(id: string): Promise<void> {
    await db.delete(quotes).where(eq(quotes.id, id));
  }
}
