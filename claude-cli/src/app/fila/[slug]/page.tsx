"use client";

import { use } from "react";
import { usePublicQueue } from "@/hooks/use-queue";
import { QUEUE_REFRESH_INTERVAL } from "@/lib/constants";
import { Clock, Droplets, Car } from "lucide-react";

function formatWaitTime(minutes: number): string {
  if (minutes === 0) return "Proximo";
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `~${h}h ${m}min` : `~${h}h`;
}

function StatusDot({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    "Em Andamento": "bg-green-500",
    Aguardando: "bg-yellow-500",
  };
  const color = colorMap[status] || "bg-gray-400";
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
}

export default function PublicQueuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data, isLoading, error } = usePublicQueue(slug, QUEUE_REFRESH_INTERVAL);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Droplets className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {isLoading ? "Carregando..." : data?.businessName || "AquaWash"}
            </h1>
            <p className="text-xs text-gray-500">Fila de atendimento em tempo real</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-white/60"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">
              Nao foi possivel carregar a fila. Verifique o endereco e tente novamente.
            </p>
          </div>
        )}

        {data && data.entries.length === 0 && (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <Car className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-lg font-medium text-gray-600">
              Fila vazia
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Nenhum veiculo na fila no momento.
            </p>
          </div>
        )}

        {data && data.entries.length > 0 && (
          <div className="space-y-3">
            {data.entries.map((entry) => (
              <div
                key={entry.position}
                className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-all"
              >
                {/* Position */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {entry.position}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-800">
                      {entry.maskedPlate}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <StatusDot status={entry.status} />
                      {entry.status}
                    </span>
                  </div>
                </div>

                {/* Wait time */}
                <div className="shrink-0 text-right">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {formatWaitTime(entry.estimatedWaitMinutes)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Auto-refresh indicator */}
        <p className="mt-8 text-center text-xs text-gray-400">
          Atualiza automaticamente a cada 30 segundos
        </p>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-white/60 py-4 text-center text-xs text-gray-400">
        Powered by AquaWash
      </footer>
    </div>
  );
}
