import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "@/lib/fetch";

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: () => apiGet("/api/funcionarios"),
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => apiPost("/api/funcionarios", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      apiPut(`/api/funcionarios/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}
