"use client";

import { useQuery } from "@tanstack/react-query";

export function usePublicQueue(slug: string) {
  return useQuery({
    queryKey: ["public-queue", slug],
    queryFn: async () => {
      const response = await fetch(`/api/fila/publica/${slug}`);
      if (!response.ok) {
        throw new Error("Nao foi possivel carregar a fila.");
      }
      return response.json();
    },
    refetchInterval: 30_000,
  });
}
