import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/fetch";

export function useCustomers(search?: string) {
  return useQuery({
    queryKey: ["customers", search],
    queryFn: () => apiGet(`/api/clientes${search ? `?search=${search}` : ""}`),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => apiGet(`/api/clientes/${id}`),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => apiPost("/api/clientes", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      apiPut(`/api/clientes/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/clientes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: string; data: unknown }) =>
      apiPost(`/api/clientes/${customerId}/veiculos`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
  });
}
