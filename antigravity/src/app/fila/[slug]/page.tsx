"use client";
import { useState, useEffect, use } from "react";
import { Droplets, Clock, Car, RefreshCw } from "lucide-react";
import { SERVICE_ORDER_STATUS_LABELS } from "@/lib/constants";

interface QueueItem { position: number; plate: string; vehicleDescription: string; color: string; status: string; estimatedWaitMinutes: number; }

export default function PublicQueuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<{ businessName: string; phone: string; queue: QueueItem[] } | null>(null);
  const [error, setError] = useState("");

  const fetchQueue = async () => {
    try { const res = await fetch(`/api/fila/publica/${slug}`); const json = await res.json(); if (json.success) setData(json.data); else setError("Lava-jato não encontrado"); } catch { setError("Erro ao carregar fila"); }
  };

  useEffect(() => { fetchQueue(); const interval = setInterval(fetchQueue, 30000); return () => clearInterval(interval); }, [slug]);

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="text-center"><Droplets className="w-12 h-12 mx-auto mb-4 text-blue-400 opacity-50" /><p className="text-lg text-gray-600 dark:text-gray-400">{error}</p></div>
    </div>
  );

  if (!data) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800"><RefreshCw className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="sticky top-0 z-10 glass border-b border-blue-100 dark:border-gray-700 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"><Droplets className="w-5 h-5 text-white" /></div>
            <div><h1 className="font-bold text-lg">{data.businessName}</h1><p className="text-xs text-gray-500">Fila de Atendimento</p></div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-green-500 status-dot-pulse" /> Ao vivo</div>
        </div>
      </header>
      <main className="max-w-2xl mx-auto p-4 space-y-3">
        {data.queue.length === 0 ? (
          <div className="text-center py-16"><Car className="w-16 h-16 mx-auto mb-4 text-blue-300 opacity-50" /><p className="text-xl font-semibold text-gray-700 dark:text-gray-300">Fila vazia!</p><p className="text-gray-500 text-sm">Não há veículos aguardando no momento</p></div>
        ) : data.queue.map((item, idx) => (
          <div key={idx} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-blue-100 dark:border-gray-700 rounded-2xl p-4 flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">{item.position}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{item.plate}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"}`}>{SERVICE_ORDER_STATUS_LABELS[item.status] || item.status}</span>
              </div>
              <p className="text-sm text-gray-500">{item.vehicleDescription} {item.color ? `• ${item.color}` : ""}</p>
            </div>
            <div className="text-right"><div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold"><Clock className="w-4 h-4" />{item.estimatedWaitMinutes > 0 ? `~${item.estimatedWaitMinutes}min` : "Agora"}</div></div>
          </div>
        ))}
        <p className="text-center text-xs text-gray-400 pt-4">Atualiza automaticamente a cada 30 segundos</p>
      </main>
    </div>
  );
}
