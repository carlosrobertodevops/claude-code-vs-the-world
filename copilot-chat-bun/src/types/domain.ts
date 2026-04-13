export type UserRole = "MANAGER" | "EMPLOYEE";
export type QuoteStatus = "DRAFT" | "SENT" | "APPROVED";
export type ContractStatus = "PENDING" | "SIGNED";
export type ServiceOrderStatus =
  | "WAITING"
  | "IN_PROGRESS"
  | "DONE"
  | "DELIVERED";
export type QueueStatus = "QUEUED" | "WASHING" | "READY" | "DELIVERED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
}

export interface Customer {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  brand: string;
  model: string;
  plate: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  unit: string;
  stock: number;
  minimumStock: number;
  unitPrice: number;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  durationMinutes: number;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  customerId: string;
  vehicleId: string;
  status: QuoteStatus;
  validUntil: string;
  total: number;
  items: QuoteItem[];
}

export interface Contract {
  id: string;
  quoteId: string;
  customerId: string;
  status: ContractStatus;
  signedAt?: string;
  notes: string;
}

export interface ServiceOrderItem {
  id: string;
  serviceOrderId: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ServiceOrder {
  id: string;
  customerId: string;
  vehicleId: string;
  assignedEmployeeId: string;
  status: ServiceOrderStatus;
  createdAt: string;
  scheduledFor: string;
  total: number;
  notes: string;
  items: ServiceOrderItem[];
}

export interface QueueEntry {
  id: string;
  serviceOrderId: string;
  position: number;
  status: QueueStatus;
  etaMinutes: number;
  updatedAt: string;
}

export interface CarWashConfig {
  id: string;
  name: string;
  slug: string;
  address: string;
  themeAccent: string;
  darkBackground: string;
  lightBackground: string;
  publicQueueEnabled: boolean;
}

export interface DashboardSummary {
  revenueToday: number;
  openOrders: number;
  queueLength: number;
  lowStockItems: number;
  pendingQuotes: number;
  signedContracts: number;
}

export interface ReportRow {
  label: string;
  value: number;
}
