"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";

interface RevenuePoint { day: string; total: string | null }

export default function DashboardHome() {
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  useEffect(() => {
    api<RevenuePoint[]>("/relatorios/receita").then(setRevenue).catch(() => setRevenue([]));
  }, []);
  const total = revenue.reduce((s, r) => s + Number(r.total ?? 0), 0);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Receita (últimos 30 dias)</p>
          <p className="mt-2 text-3xl font-bold">R$ {total.toFixed(2)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Dias com venda</p>
          <p className="mt-2 text-3xl font-bold">{revenue.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Ticket médio</p>
          <p className="mt-2 text-3xl font-bold">R$ {revenue.length ? (total / revenue.length).toFixed(2) : "0.00"}</p>
        </Card>
      </div>
    </div>
  );
}
