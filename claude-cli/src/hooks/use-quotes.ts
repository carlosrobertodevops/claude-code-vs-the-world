import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateQuoteInput } from "@/lib/validations/quote";

interface QuoteItem {
  id: string;
  quoteId: string;
  serviceTypeId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  serviceType: { id: string; name: string };
}

interface Quote {
  id: string;
  customerId: string;
  quoteNumber: string;
  status: string;
  totalAmount: number;
  notes: string | null;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  items: QuoteItem[];
}

interface QuotesResponse {
  success: true;
  data: Quote[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface QuoteResponse {
  success: true;
  data: Quote;
}

async function fetchQuotes(params?: { status?: string; search?: string; page?: number }): Promise<QuotesResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.page) searchParams.set("page", String(params.page));

  const res = await fetch(`/api/orcamentos?${searchParams.toString()}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Erro ao buscar orcamentos");
  }
  return res.json();
}

async function fetchQuote(id: string): Promise<QuoteResponse> {
  const res = await fetch(`/api/orcamentos/${id}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Erro ao buscar orcamento");
  }
  return res.json();
}

async function createQuote(data: CreateQuoteInput): Promise<QuoteResponse> {
  const res = await fetch("/api/orcamentos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Erro ao criar orcamento");
  }
  return res.json();
}

async function updateQuote(params: { id: string; data: Partial<CreateQuoteInput> & { status?: string } }): Promise<QuoteResponse> {
  const res = await fetch(`/api/orcamentos/${params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params.data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Erro ao atualizar orcamento");
  }
  return res.json();
}

async function deleteQuote(id: string): Promise<{ success: true; data: { id: string } }> {
  const res = await fetch(`/api/orcamentos/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Erro ao excluir orcamento");
  }
  return res.json();
}

export function useQuotes(params?: { status?: string; search?: string; page?: number }) {
  return useQuery({
    queryKey: ["quotes", params],
    queryFn: () => fetchQuotes(params),
  });
}

export function useQuote(id: string) {
  return useQuery({
    queryKey: ["quotes", id],
    queryFn: () => fetchQuote(id),
    enabled: !!id,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}

export function useUpdateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}

export function useDeleteQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
}

export type { Quote, QuoteItem };
