export interface StockMovement {
  id: string;
  productId: string;
  qtyDelta: number;
  reason: string;
  refServiceOrderId: string | null;
  userId: string | null;
  createdAt: Date;
}

export interface UpdateStockInput {
  productId: string;
  qtyDelta: number;
  reason: string;
  userId?: string;
  refServiceOrderId?: string;
}
