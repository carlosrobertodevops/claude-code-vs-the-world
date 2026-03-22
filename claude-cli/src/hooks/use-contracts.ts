import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateContractInput, UpdateContractInput, SignContractInput } from "@/lib/validations/contract";

interface Contract {
  id: string;
  customerId: string;
  contractNumber: string;
  status: string;
  title: string;
  content: string;
  signatureData: string | null;
  signatureIp: string | null;
  signedAt: string | null;
  pdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
}

interface ContractsResponse {
  success: true;
  data: Contract[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface ContractResponse {
  success: true;
  data: Contract;
}

async function fetchContracts(params?: { status?: string; search?: string; page?: number }): Promise<ContractsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.page) searchParams.set("page", String(params.page));

  const res = await fetch(`/api/contratos?${searchParams.toString()}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Erro ao buscar contratos");
  }
  return res.json();
}

async function fetchContract(id: string): Promise<ContractResponse> {
  const res = await fetch(`/api/contratos/${id}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Erro ao buscar contrato");
  }
  return res.json();
}

async function createContract(data: CreateContractInput): Promise<ContractResponse> {
  const res = await fetch("/api/contratos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Erro ao criar contrato");
  }
  return res.json();
}

async function updateContract(params: { id: string; data: UpdateContractInput }): Promise<ContractResponse> {
  const res = await fetch(`/api/contratos/${params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params.data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Erro ao atualizar contrato");
  }
  return res.json();
}

async function deleteContract(id: string): Promise<{ success: true; data: { id: string } }> {
  const res = await fetch(`/api/contratos/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Erro ao excluir contrato");
  }
  return res.json();
}

async function signContract(params: { id: string; data: SignContractInput }): Promise<ContractResponse> {
  const res = await fetch(`/api/contratos/${params.id}/assinar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params.data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Erro ao assinar contrato");
  }
  return res.json();
}

export function useContracts(params?: { status?: string; search?: string; page?: number }) {
  return useQuery({
    queryKey: ["contracts", params],
    queryFn: () => fetchContracts(params),
  });
}

export function useContract(id: string) {
  return useQuery({
    queryKey: ["contracts", id],
    queryFn: () => fetchContract(id),
    enabled: !!id,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useDeleteContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useSignContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export type { Contract };
