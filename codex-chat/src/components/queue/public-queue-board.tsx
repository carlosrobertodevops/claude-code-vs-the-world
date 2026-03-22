"use client";

import { Clock3, RefreshCcw } from "lucide-react";

import { Card } from "@/components/ui/card";
import { usePublicQueue } from "@/hooks/use-public-queue";
import { formatDateTime } from "@/lib/utils";

export function PublicQueueBoard({ slug }: { slug: string }) {
  const { data, isLoading, refetch, isRefetching } = usePublicQueue(slug);

  if (isLoading) {
    return <Card>Carregando fila publica...</Card>;
  }

  const payload = data?.data;

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--primary)]">Fila publica</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{payload.config.businessName}</h1>
          <p className="mt-2 text-sm text-slate-600">Atualizacao automatica a cada 30 segundos.</p>
        </div>
        <button
          className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
          type="button"
          onClick={() => refetch()}
        >
          <RefreshCcw className={`mr-2 size-4 ${isRefetching ? "animate-spin" : ""}`} />
          Atualizar agora
        </button>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {payload.entries.map((entry: { id: string; position: number; plate: string; estimatedStart: string; estimatedEnd: string; status: string; orderNumber: string }) => (
          <Card key={entry.id} className="border-l-4 border-l-[var(--accent)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">Posicao #{entry.position}</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">{entry.plate}</h3>
                <p className="mt-1 text-sm text-slate-600">{entry.orderNumber}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{entry.status}</span>
            </div>
            <div className="mt-6 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <Clock3 className="mb-2 size-4 text-[var(--primary)]" />
                <p>Inicio previsto</p>
                <p className="mt-1 font-semibold text-slate-900">{formatDateTime(entry.estimatedStart)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <Clock3 className="mb-2 size-4 text-[var(--primary)]" />
                <p>Termino previsto</p>
                <p className="mt-1 font-semibold text-slate-900">{formatDateTime(entry.estimatedEnd)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
