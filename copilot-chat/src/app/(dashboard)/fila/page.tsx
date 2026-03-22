"use client";

import { useQueue, useReorderQueue } from "@/hooks/use-queue";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Clock } from "lucide-react";
import { toast } from "sonner";

type QueueEntry = {
  id: string; position: number;
  serviceOrder: {
    orderNumber: string; status: string;
    customer: { name: string };
    vehicle: { plate: string; model: string };
    items: { serviceType: { name: string } }[];
  };
};

export default function FilaPage() {
  const { data: queue = [], isLoading } = useQueue() as { data: QueueEntry[]; isLoading: boolean };
  const reorder = useReorderQueue();

  async function move(id: string, direction: "up" | "down") {
    const sorted = [...queue].sort((a, b) => a.position - b.position);
    const idx = sorted.findIndex((e) => e.id === id);
    if (direction === "up" && idx <= 0) return;
    if (direction === "down" && idx >= sorted.length - 1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newOrder = sorted.map((e) => e.id);
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    const entries = newOrder.map((id, i) => ({ id, position: i + 1 }));
    try {
      await reorder.mutateAsync(entries);
      toast.success("Fila reordenada!");
    } catch (err: unknown) { toast.error((err as Error).message); }
  }

  const sorted = [...queue].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fila de Atendimento</h1>
        <p className="text-muted-foreground">Veja e reordene veiculos na fila</p>
      </div>
      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : sorted.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Clock className="mx-auto h-12 w-12 mb-4" />Nenhum veiculo na fila</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((entry, idx) => (
            <Card key={entry.id} className="flex items-center gap-4 p-4">
              <div className="flex flex-col gap-1">
                <Button size="icon" variant="ghost" disabled={idx === 0} onClick={() => move(entry.id, "up")}><ArrowUp className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" disabled={idx === sorted.length - 1} onClick={() => move(entry.id, "down")}><ArrowDown className="h-4 w-4" /></Button>
              </div>
              <Badge variant="outline" className="text-lg font-bold px-3">{idx + 1}</Badge>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{entry.serviceOrder.orderNumber}</span>
                  <StatusBadge status={entry.serviceOrder.status} />
                </div>
                <p className="text-sm text-muted-foreground">{entry.serviceOrder.customer.name} - {entry.serviceOrder.vehicle.plate} ({entry.serviceOrder.vehicle.model})</p>
                <p className="text-xs text-muted-foreground">{entry.serviceOrder.items.map((i) => i.serviceType.name).join(", ")}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
