export interface Product {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  price: string;
  stockQty: number;
  minStock: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateProductInput {
  name: string;
  sku?: string;
  unit?: string;
  price?: string;
  stockQty?: number;
  minStock?: number;
}

export type UpdateProductInput = Partial<CreateProductInput>;
