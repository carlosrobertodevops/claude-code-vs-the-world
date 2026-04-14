import type {
  CreateServiceOrderInput,
  ServiceOrder,
  UpdateServiceOrderStatusInput,
} from "@/lib/types/service-order.types";
import type { OrderStatus, PaginatedResult, PaginationInput } from "@/lib/types/common.types";

export interface ListServiceOrdersFilters extends PaginationInput {
  customerId?: string;
  employeeId?: string;
  status?: OrderStatus;
  from?: Date;
  to?: Date;
}

export interface IServiceOrderRepository {
  findById(id: string): Promise<ServiceOrder | null>;
  list(filters: ListServiceOrdersFilters): Promise<PaginatedResult<ServiceOrder>>;
  create(input: CreateServiceOrderInput): Promise<ServiceOrder>;
  updateStatus(input: UpdateServiceOrderStatusInput): Promise<ServiceOrder>;
  softDelete(id: string): Promise<void>;
  listByCustomer(customerId: string): Promise<ServiceOrder[]>;
}
