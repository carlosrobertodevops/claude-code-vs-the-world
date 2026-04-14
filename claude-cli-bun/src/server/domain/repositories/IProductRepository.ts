import type { CreateProductInput, Product, UpdateProductInput } from "@/lib/types/product.types";
import type { PaginatedResult, PaginationInput } from "@/lib/types/common.types";
import type { StockMovement, UpdateStockInput } from "@/lib/types/stock.types";

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  list(pagination: PaginationInput): Promise<PaginatedResult<Product>>;
  create(input: CreateProductInput): Promise<Product>;
  update(id: string, input: UpdateProductInput): Promise<Product>;
  softDelete(id: string): Promise<void>;
  updateStock(input: UpdateStockInput): Promise<StockMovement>;
  listLowStock(): Promise<Product[]>;
}
