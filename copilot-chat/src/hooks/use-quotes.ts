import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/fetch";

export function useQuotes(status?: string) {
  return useQuery({
    queryKey: ["quotes", status],
    queryFn: () => apiGet(`/api/orcamentos${status ? `?status=${status}` : ""}`),
  });
}

export function useQuote(id: string) {
  return useQuery({
    queryKey: ["quotes", id],
    queryFn: () => apiGet(`/api/orcamentos/${id}`),
    enabled: !!id,
  });
}

export function useCreateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => apiPost("/api/orcamentos", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

export function useUpdateQuoteStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch(`/api/orcamentos/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

export function useDeleteQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/orcamentos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}
