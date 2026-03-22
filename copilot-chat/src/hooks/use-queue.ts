import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/fetch";

export function useQueue() {
  return useQuery({
    queryKey: ["queue"],
    queryFn: () => apiGet("/api/fila"),
  });
}

export function usePublicQueue(slug: string) {
  return useQuery({
    queryKey: ["publicQueue", slug],
    queryFn: () => apiGet(`/api/fila/publica/${slug}`),
    enabled: !!slug,
    refetchInterval: 30000,
  });
}

export function useReorderQueue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entries: { id: string; position: number }[]) =>
      apiPatch("/api/fila", { entries }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["queue"] }),
  });
}
