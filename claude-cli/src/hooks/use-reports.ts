import { useQuery } from "@tanstack/react-query";

export interface DailyRevenue {
  date: string;
  total: number;
}

export interface RevenueData {
  dailyRevenue: DailyRevenue[];
  totalRevenue: number;
  orderCount: number;
}

export interface TopService {
  name: string;
  count: number;
  revenue: number;
}

export interface ServicesData {
  topServices: TopService[];
}

export interface LowStockProduct {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  costPrice: number;
}

export interface InventoryData {
  lowStockProducts: LowStockProduct[];
}

export interface TopCustomer {
  id: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
}

export interface CustomersData {
  topCustomers: TopCustomer[];
}

interface ApiError {
  success: false;
  error: { code: string; message: string };
}

async function fetchReport<T>(type: string): Promise<T> {
  const res = await fetch(`/api/relatorios?type=${type}`);
  const json = await res.json();
  if (!res.ok) {
    const err = json as ApiError;
    throw new Error(err.error?.message || "Erro ao gerar relatorio");
  }
  return json.data as T;
}

export function useRevenueReport() {
  return useQuery({
    queryKey: ["reports", "revenue"],
    queryFn: () => fetchReport<RevenueData>("revenue"),
  });
}

export function useServicesReport() {
  return useQuery({
    queryKey: ["reports", "services"],
    queryFn: () => fetchReport<ServicesData>("services"),
  });
}

export function useInventoryReport() {
  return useQuery({
    queryKey: ["reports", "inventory"],
    queryFn: () => fetchReport<InventoryData>("inventory"),
  });
}

export function useCustomersReport() {
  return useQuery({
    queryKey: ["reports", "customers"],
    queryFn: () => fetchReport<CustomersData>("customers"),
  });
}
