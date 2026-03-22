import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/fetch";

export function useServiceOrders(status?: string, search?: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  const qs = params.toString();
  return useQuery({
    queryKey: ["serviceOrders", status, search],
    queryFn: () => apiGet(`/api/servicos${qs ? `?${qs}` : ""}`),
  });
}

export function useServiceOrder(id: string) {
  return useQuery({
    queryKey: ["serviceOrders", id],
    queryFn: () => apiGet(`/api/servicos/${id}`),
    enabled: !!id,
  });
}

export function useCreateServiceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => apiPost("/api/servicos", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["serviceOrders"] });
      qc.invalidateQueries({ queryKey: ["queue"] });
    },
  });
}

export function useUpdateServiceOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch(`/api/servicos/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["serviceOrders"] });
      qc.invalidateQueries({ queryKey: ["queue"] });
    },
  });
}

export function useServiceTypes() {
  return useQuery({
    queryKey: ["serviceTypes"],
    queryFn: () => apiGet("/api/servicos/tipos"),
  });
}

export function useCreateServiceType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => apiPost("/api/servicos/tipos", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["serviceTypes"] }),
  });
}
