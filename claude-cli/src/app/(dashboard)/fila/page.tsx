"use client";

import { useQueue, useReorderQueue, type QueueEntry } from "@/hooks/use-queue";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, Clock, Car, User } from "lucide-react";
import { toast } from "sonner";
import { STATUS_LABELS } from "@/lib/constants";

const statusVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  WAITING: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "outline",
  CANCELLED: "destructive",
};

function getEstimatedMinutes(entry: QueueEntry): number {
  return entry.serviceOrder.items.reduce(
    (sum, item) => sum + (item.serviceType?.estimatedMinutes ?? 0) * item.quantity,
    0
  );
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export default function QueuePage() {
  const { data: entries, isLoading } = useQueue();
  const reorder = useReorderQueue();

  function handleMove(entryId: string, direction: "up" | "down") {
    if (!entries) return;
    const index = entries.findIndex((e) => e.id === entryId);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === entries.length - 1) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const newEntries = [...entries];
    const temp = newEntries[index];
    newEntries[index] = newEntries[swapIndex];
    newEntries[swapIndex] = temp;

    const reordered = newEntries.map((e, i) => ({
      id: e.id,
      position: i + 1,
    }));

    reorder.mutate(reordered, {
      onError: (error) => {
        toast.error(error.message);
      },
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Fila de Atendimento</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fila de Atendimento</h1>
        <span className="text-sm text-muted-foreground">
          {entries?.length ?? 0} {entries?.length === 1 ? "entrada" : "entradas"} na fila
        </span>
      </div>

      {(!entries || entries.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum veiculo na fila no momento.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {entries?.map((entry, index) => (
          <Card key={entry.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {entry.position}
                  </span>
                  <CardTitle className="text-base">
                    {entry.serviceOrder.orderNumber}
                  </CardTitle>
                </div>
                <Badge
                  variant={statusVariantMap[entry.serviceOrder.status] || "secondary"}
                >
                  {STATUS_LABELS[entry.serviceOrder.status] || entry.serviceOrder.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{entry.serviceOrder.customer.name}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span>
                  {entry.serviceOrder.vehicle.plate} - {entry.serviceOrder.vehicle.brand}{" "}
                  {entry.serviceOrder.vehicle.model}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Tempo estimado: {formatMinutes(getEstimatedMinutes(entry))}</span>
              </div>

              {entry.serviceOrder.items.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Servicos:</p>
                  <div className="flex flex-wrap gap-1">
                    {entry.serviceOrder.items.map((item) => (
                      <Badge key={item.id} variant="outline" className="text-xs">
                        {item.serviceType?.name || item.product?.name || item.description || "Item"}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-1 pt-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={index === 0 || reorder.isPending}
                  onClick={() => handleMove(entry.id, "up")}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={index === (entries?.length ?? 0) - 1 || reorder.isPending}
                  onClick={() => handleMove(entry.id, "down")}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
