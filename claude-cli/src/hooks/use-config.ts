import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface CarWashConfig {
  id: string;
  businessName: string;
  slug: string;
  simultaneousSlots: number;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
}

export interface UpdateConfigInput {
  businessName: string;
  slug: string;
  simultaneousSlots: number;
  phone?: string | null;
  address?: string | null;
}

interface ApiError {
  success: false;
  error: { code: string; message: string };
}

async function fetchConfig(): Promise<CarWashConfig> {
  const res = await fetch("/api/configuracoes");
  const json = await res.json();
  if (!res.ok) {
    const err = json as ApiError;
    throw new Error(err.error?.message || "Erro ao buscar configuracoes");
  }
  return json.data as CarWashConfig;
}

async function updateConfig(data: UpdateConfigInput): Promise<CarWashConfig> {
  const res = await fetch("/api/configuracoes", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    const err = json as ApiError;
    throw new Error(err.error?.message || "Erro ao atualizar configuracoes");
  }
  return json.data as CarWashConfig;
}

export function useConfig() {
  return useQuery({
    queryKey: ["config"],
    queryFn: fetchConfig,
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });
}
