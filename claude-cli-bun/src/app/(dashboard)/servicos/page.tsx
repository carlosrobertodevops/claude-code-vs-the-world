"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ServiceOrder } from "@/lib/types/service-order.types";
import type { OrderStatus } from "@/lib/types/common.types";

const NEXT: Record<OrderStatus, OrderStatus | null> = {
  PENDING: "IN_PROGRESS", IN_PROGRESS: "DONE", DONE: "DELIVERED", DELIVERED: null, CANCELLED: null,
};

export default function ServiceOrdersPage() {
  const [list, setList] = useState<ServiceOrder[]>([]);
  const load = () => api<ServiceOrder[]>("/servicos").then(setList).catch(() => setList([]));
  useEffect(() => { load(); }, []);
  async function advance(id: string, next: OrderStatus) {
    await api(`/servicos/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: next }) });
    load();
  }
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Ordens de Serviço</h1>
      <Table>
        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Status</TableHead><TableHead>Total</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>
          {list.map((o) => {
            const next = NEXT[o.status];
            return (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}</TableCell>
                <TableCell><Badge>{o.status}</Badge></TableCell>
                <TableCell>R$ {o.total}</TableCell>
                <TableCell>{next && <Button size="sm" onClick={() => advance(o.id, next)}>→ {next}</Button>}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
