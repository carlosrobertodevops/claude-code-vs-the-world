import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/fetch";

export function useProducts(search?: string) {
  return useQuery({
    queryKey: ["products", search],
    queryFn: () => apiGet(`/api/inventario${search ? `?search=${search}` : ""}`),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => apiGet(`/api/inventario/${id}`),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => apiPost("/api/inventario", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      apiPut(`/api/inventario/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/inventario/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useCreateStockMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => apiPost("/api/inventario/movimentacoes", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}
