import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product, StockMovement } from "@/generated/prisma/client";
import type { CreateProductInput, UpdateProductInput, CreateStockMovementInput } from "@/lib/validations/product";
import type { ApiResponse } from "@/types";

// ---- Products ----

async function fetchProducts(search?: string, isActive?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (isActive !== undefined && isActive !== "") params.set("isActive", isActive);

  const res = await fetch(`/api/inventario?${params.toString()}`);
  const json: ApiResponse<Product[]> = await res.json();

  if (!json.success) {
    throw new Error(json.error.message);
  }

  return json.data;
}

export function useProducts(search?: string, isActive?: string) {
  return useQuery({
    queryKey: ["products", search, isActive],
    queryFn: () => fetchProducts(search, isActive),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductInput) => {
      const res = await fetch("/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json: ApiResponse<Product> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductInput }) => {
      const res = await fetch(`/api/inventario/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json: ApiResponse<Product> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/inventario/${id}`, {
        method: "DELETE",
      });
      const json: ApiResponse<{ id: string }> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// ---- Stock Movements ----

type StockMovementWithUser = StockMovement & {
  user: { id: string; name: string };
};

async function fetchStockMovements(productId: string): Promise<StockMovementWithUser[]> {
  const res = await fetch(`/api/inventario/movimentacoes?productId=${productId}`);
  const json: ApiResponse<StockMovementWithUser[]> = await res.json();

  if (!json.success) {
    throw new Error(json.error.message);
  }

  return json.data;
}

export function useStockMovements(productId: string) {
  return useQuery({
    queryKey: ["stockMovements", productId],
    queryFn: () => fetchStockMovements(productId),
    enabled: !!productId,
  });
}

export function useCreateStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStockMovementInput) => {
      const res = await fetch("/api/inventario/movimentacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json: ApiResponse<StockMovement> = await res.json();
      if (!json.success) throw new Error(json.error.message);
      return json.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stockMovements", variables.productId] });
    },
  });
}
