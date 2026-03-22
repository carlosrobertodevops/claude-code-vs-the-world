import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateServiceOrderInput } from "@/lib/validations/service";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message || "Erro desconhecido");
  }
  return json;
}

// Service orders list
export function useServiceOrders(status?: string) {
  return useQuery({
    queryKey: ["service-orders", status],
    queryFn: () => {
      const params = new URLSearchParams();
      if (status && status !== "ALL") params.set("status", status);
      params.set("limit", "100");
      return fetchJson<{ success: true; data: ServiceOrderListItem[] }>(
        `/api/servicos?${params.toString()}`
      );
    },
    select: (res) => res.data,
  });
}

// Single service order
export function useServiceOrder(id: string) {
  return useQuery({
    queryKey: ["service-orders", id],
    queryFn: () =>
      fetchJson<{ success: true; data: ServiceOrderDetail }>(
        `/api/servicos/${id}`
      ),
    select: (res) => res.data,
    enabled: !!id,
  });
}

// Create service order
export function useCreateServiceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServiceOrderInput) =>
      fetchJson("/api/servicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-orders"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

// Update service order status
export function useUpdateServiceOrderStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: string) =>
      fetchJson(`/api/servicos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-orders"] });
    },
  });
}

// Delete service order
export function useDeleteServiceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/servicos/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-orders"] });
    },
  });
}

// Service types (for the order form)
export function useServiceTypes() {
  return useQuery({
    queryKey: ["service-types"],
    queryFn: () =>
      fetchJson<{ success: true; data: ServiceType[] }>("/api/service-types"),
    select: (res) => res.data,
  });
}

// Employees (for the order form)
export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      try {
        return await fetchJson<{ success: true; data: Employee[] }>("/api/funcionarios");
      } catch {
        return { success: true as const, data: [] as Employee[] };
      }
    },
    select: (res) => res.data,
  });
}

// Customer service orders
export function useCustomerServiceOrders(customerId: string) {
  return useQuery({
    queryKey: ["service-orders", "customer", customerId],
    queryFn: () =>
      fetchJson<{ success: true; data: ServiceOrderListItem[] }>(
        `/api/servicos?customerId=${customerId}&limit=100`
      ),
    select: (res) => res.data,
    enabled: !!customerId,
  });
}

// Types
export interface ServiceOrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  notes: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  customer: { id: string; name: string; phone: string };
  vehicle: { id: string; plate: string; brand: string; model: string };
  employee: { id: string; name: string } | null;
  items: ServiceOrderItemData[];
}

export interface ServiceOrderItemData {
  id: string;
  serviceTypeId: string | null;
  productId: string | null;
  description: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  serviceType: { id: string; name: string } | null;
}

export interface ServiceOrderDetail extends ServiceOrderListItem {
  photos: { id: string; url: string; caption: string | null; createdAt: string }[];
  queueEntry: { id: string; position: number } | null;
}

export interface ServiceType {
  id: string;
  name: string;
  basePrice: number;
  estimatedMinutes: number;
  isActive: boolean;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
}
