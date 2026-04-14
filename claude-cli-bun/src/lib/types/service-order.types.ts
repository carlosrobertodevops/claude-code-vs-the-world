import type { OrderStatus } from "./common.types";

export interface ServiceOrder {
  id: string;
  customerId: string;
  vehicleId: string;
  employeeId: string | null;
  status: OrderStatus;
  notes: string | null;
  total: string;
  startedAt: Date | null;
  finishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ServiceOrderItem {
  id: string;
  serviceOrderId: string;
  serviceTypeId: string | null;
  productId: string | null;
  qty: number;
  unitPrice: string;
}

export interface CreateServiceOrderInput {
  customerId: string;
  vehicleId: string;
  employeeId?: string;
  notes?: string;
  items: Array<Omit<ServiceOrderItem, "id" | "serviceOrderId">>;
}

export interface UpdateServiceOrderStatusInput {
  orderId: string;
  status: OrderStatus;
}
