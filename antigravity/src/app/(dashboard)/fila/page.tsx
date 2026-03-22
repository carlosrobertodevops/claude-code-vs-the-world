"use client";

import { useState, useEffect } from "react";
import { SERVICE_ORDER_STATUS_LABELS, SERVICE_ORDER_STATUS_COLORS } from "@/lib/constants";
import { Loader2, Clock, Car, User, GripVertical } from "lucide-react";

interface QueueEntry {
  id: string;
  position: number;
  serviceOrder: {
    id: string;
    orderNumber: string;
    status: string;
    customer: { name: string };
    vehicle: { plate: string; brand: string; model: string; color: string };
    employee: { name: string } | null;
    items: Array<{ serviceType: { name: string; estimatedMinutes: number } | null }>;
  };
}

export default function FilaPage() {
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/fila");
      const json = await res.json();
      if (json.success) setEntries(json.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchQueue(); const interval = setInterval(fetchQueue, 30000); return () => clearInterval(interval); }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Fila de Atendimento</h1><p className="text-sm text-[hsl(var(--muted-foreground))]">Visualize e gerencie a fila em tempo real</p></div>
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <div className="w-2 h-2 rounded-full bg-green-500 status-dot-pulse"></div>
          Atualiza a cada 30s
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[hsl(var(--muted-foreground))]">
          <Car className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-lg font-medium">Fila vazia</p>
          <p className="text-sm">Nenhum veículo aguardando atendimento</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {entries.map((entry, index) => {
            const totalMinutes = entry.serviceOrder.items.reduce((sum, item) => sum + (item.serviceType?.estimatedMinutes || 30), 0);
            return (
              <div key={entry.id} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 flex items-center gap-4 card-hover animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-[hsl(var(--muted-foreground))] cursor-grab" />
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] flex items-center justify-center text-white font-bold text-sm">
                    {entry.position}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{entry.serviceOrder.orderNumber}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${SERVICE_ORDER_STATUS_COLORS[entry.serviceOrder.status]}`}>
                      {SERVICE_ORDER_STATUS_LABELS[entry.serviceOrder.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{entry.serviceOrder.customer.name}</span>
                    <span className="flex items-center gap-1"><Car className="w-3 h-3" />{entry.serviceOrder.vehicle.brand} {entry.serviceOrder.vehicle.model} - {entry.serviceOrder.vehicle.plate}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />~{totalMinutes}min</span>
                  </div>
                </div>
                <div className="text-right text-xs text-[hsl(var(--muted-foreground))]">
                  {entry.serviceOrder.items.map(i => i.serviceType?.name).filter(Boolean).join(", ")}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
