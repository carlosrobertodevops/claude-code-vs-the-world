import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch } from "@/lib/fetch";

export function useContracts() {
  return useQuery({
    queryKey: ["contracts"],
    queryFn: () => apiGet("/api/contratos"),
  });
}

export function useContract(id: string) {
  return useQuery({
    queryKey: ["contracts", id],
    queryFn: () => apiGet(`/api/contratos/${id}`),
    enabled: !!id,
  });
}

export function useCreateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => apiPost("/api/contratos", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contracts"] }),
  });
}

export function useUpdateContractStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch(`/api/contratos/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contracts"] }),
  });
}

export function useSignContract() {
  return useMutation({
    mutationFn: ({ id, signatureData }: { id: string; signatureData: string }) =>
      apiPost(`/api/contratos/${id}/assinar`, { signatureData }),
  });
}
