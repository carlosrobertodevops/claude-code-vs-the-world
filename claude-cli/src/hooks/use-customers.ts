import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateCustomerInput, UpdateCustomerInput, CreateVehicleInput } from "@/lib/validations/customer";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message || "Erro desconhecido");
  }
  return json;
}

// Customers list
export function useCustomers(search?: string) {
  return useQuery({
    queryKey: ["customers", search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("limit", "100");
      return fetchJson<{ success: true; data: CustomerWithCount[] }>(
        `/api/clientes?${params.toString()}`
      );
    },
    select: (res) => res.data,
  });
}

// Single customer
export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () =>
      fetchJson<{ success: true; data: CustomerDetail }>(
        `/api/clientes/${id}`
      ),
    select: (res) => res.data,
    enabled: !!id,
  });
}

// Create customer
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerInput) =>
      fetchJson("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

// Update customer
export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCustomerInput) =>
      fetchJson(`/api/clientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

// Delete customer
export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/clientes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

// Vehicles for a customer
export function useCustomerVehicles(customerId: string) {
  return useQuery({
    queryKey: ["customers", customerId, "vehicles"],
    queryFn: () =>
      fetchJson<{ success: true; data: Vehicle[] }>(
        `/api/clientes/${customerId}/veiculos`
      ),
    select: (res) => res.data,
    enabled: !!customerId,
  });
}

// Create vehicle
export function useCreateVehicle(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<CreateVehicleInput, "customerId">) =>
      fetchJson(`/api/clientes/${customerId}/veiculos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers", customerId] });
    },
  });
}

// Types
export interface CustomerWithCount {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  cpfCnpj: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { vehicles: number };
}

export interface Vehicle {
  id: string;
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year: number | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDetail {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  cpfCnpj: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  vehicles: Vehicle[];
  _count: { vehicles: number; serviceOrders: number };
}
