import { and, count, eq, isNull, lte, sql } from "drizzle-orm";
import { db } from "../drizzle/client";
import { products, stockMovements } from "../../../../drizzle/schema";
import type { IProductRepository } from "@/server/domain/repositories/IProductRepository";
import type { CreateProductInput, Product, UpdateProductInput } from "@/lib/types/product.types";
import type { StockMovement, UpdateStockInput } from "@/lib/types/stock.types";
import type { PaginatedResult, PaginationInput } from "@/lib/types/common.types";
import { paginate, buildPaginationMeta } from "@/lib/utils/pagination";

const mapProduct = (r: typeof products.$inferSelect): Product => ({
  id: r.id, name: r.name, sku: r.sku, unit: r.unit, price: r.price, stockQty: r.stockQty, minStock: r.minStock,
  createdAt: r.createdAt, updatedAt: r.updatedAt, deletedAt: r.deletedAt,
});

export class ProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    const [r] = await db.select().from(products).where(and(eq(products.id, id), isNull(products.deletedAt))).limit(1);
    return r ? mapProduct(r) : null;
  }
  async list(p: PaginationInput): Promise<PaginatedResult<Product>> {
    const { page, limit, offset } = paginate(p);
    const rows = await db.select().from(products).where(isNull(products.deletedAt)).limit(limit).offset(offset);
    const [{ c } = { c: 0 }] = await db.select({ c: count() }).from(products).where(isNull(products.deletedAt));
    return { data: rows.map(mapProduct), meta: buildPaginationMeta(page, limit, Number(c)) };
  }
  async create(input: CreateProductInput): Promise<Product> {
    const [r] = await db.insert(products).values(input).returning();
    if (!r) throw new Error("Failed to create product");
    return mapProduct(r);
  }
  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const [r] = await db.update(products).set({ ...input, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    if (!r) throw new Error("Product not found");
    return mapProduct(r);
  }
  async softDelete(id: string): Promise<void> {
    await db.update(products).set({ deletedAt: new Date() }).where(eq(products.id, id));
  }
  async updateStock(input: UpdateStockInput): Promise<StockMovement> {
    const [mov] = await db.insert(stockMovements).values(input).returning();
    if (!mov) throw new Error("Failed to register stock movement");
    await db.update(products)
      .set({ stockQty: sql`${products.stockQty} + ${input.qtyDelta}`, updatedAt: new Date() })
      .where(eq(products.id, input.productId));
    return { ...mov };
  }
  async listLowStock(): Promise<Product[]> {
    const rows = await db.select().from(products)
      .where(and(isNull(products.deletedAt), lte(products.stockQty, sql`${products.minStock}`)));
    return rows.map(mapProduct);
  }
}
