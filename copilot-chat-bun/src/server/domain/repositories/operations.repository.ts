import type {
  CarWashConfig,
  Contract,
  Customer,
  DashboardSummary,
  Product,
  QueueEntry,
  Quote,
  ReportRow,
  ServiceOrder,
  ServiceType,
  User,
  Vehicle,
} from "@/types/domain";

export interface PublicQueueItem {
  id: string;
  customerName: string;
  vehicleLabel: string;
  position: number;
  status: QueueEntry["status"];
  etaMinutes: number;
  updatedAt: string;
}

export interface OperationsRepository {
  getConfig(): Promise<CarWashConfig>;
  getDashboardSummary(): Promise<DashboardSummary>;
  listProducts(): Promise<Product[]>;
  listCustomers(): Promise<(Customer & { vehicles: Vehicle[] })[]>;
  listServiceTypes(): Promise<ServiceType[]>;
  listServiceOrders(): Promise<
    (ServiceOrder & {
      customerName: string;
      vehicleLabel: string;
      employeeName: string;
    })[]
  >;
  listQuotes(): Promise<
    (Quote & {
      customerName: string;
      vehicleLabel: string;
    })[]
  >;
  listContracts(): Promise<
    (Contract & {
      customerName: string;
      quoteTotal: number;
    })[]
  >;
  listQueue(): Promise<PublicQueueItem[]>;
  listEmployees(): Promise<User[]>;
  getPublicQueueBySlug(slug: string): Promise<{
    config: CarWashConfig;
    queue: PublicQueueItem[];
  }>;
  exportReportRows(): Promise<ReportRow[]>;
}
