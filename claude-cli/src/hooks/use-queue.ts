import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface QueueServiceOrderItem {
  id: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  serviceType: { name: string; estimatedMinutes: number } | null;
  product: { name: string } | null;
}

export interface QueueEntry {
  id: string;
  serviceOrderId: string;
  position: number;
  estimatedStart: string | null;
  estimatedEnd: string | null;
  createdAt: string;
  updatedAt: string;
  serviceOrder: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    notes: string | null;
    customer: { id: string; name: string };
    vehicle: { id: string; plate: string; brand: string; model: string };
    items: QueueServiceOrderItem[];
  };
}

export interface PublicQueueEntry {
  position: number;
  maskedPlate: string;
  status: string;
  estimatedWaitMinutes: number;
}

export interface PublicQueueData {
  businessName: string;
  entries: PublicQueueEntry[];
}

interface ApiError {
  success: false;
  error: { code: string; message: string };
}

async function fetchQueue(): Promise<{ success: true; data: QueueEntry[] }> {
  const res = await fetch("/api/fila");
  const json = await res.json();
  if (!res.ok) {
    const err = json as ApiError;
    throw new Error(err.error?.message || "Erro ao buscar fila");
  }
  return json;
}

async function reorderQueue(
  items: Array<{ id: string; position: number }>
): Promise<{ success: true; data: QueueEntry[] }> {
  const res = await fetch("/api/fila", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  });
  const json = await res.json();
  if (!res.ok) {
    const err = json as ApiError;
    throw new Error(err.error?.message || "Erro ao reordenar fila");
  }
  return json;
}

async function fetchPublicQueue(
  slug: string
): Promise<{ success: true; data: PublicQueueData }> {
  const res = await fetch(`/api/fila/publica/${slug}`);
  const json = await res.json();
  if (!res.ok) {
    const err = json as ApiError;
    throw new Error(err.error?.message || "Erro ao buscar fila publica");
  }
  return json;
}

export function useQueue() {
  return useQuery({
    queryKey: ["queue"],
    queryFn: fetchQueue,
    select: (res) => res.data,
  });
}

export function useReorderQueue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderQueue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });
}

export function usePublicQueue(slug: string, refetchInterval?: number) {
  return useQuery({
    queryKey: ["publicQueue", slug],
    queryFn: () => fetchPublicQueue(slug),
    select: (res) => res.data,
    enabled: !!slug,
    refetchInterval: refetchInterval || 30000,
  });
}
