"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";

interface RevenuePoint { day: string; total: string | null }

export default function ReportsPage() {
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  useEffect(() => { api<RevenuePoint[]>("/relatorios/receita").then(setRevenue).catch(() => setRevenue([])); }, []);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Relatórios</h1>
      <div className="mb-4">
        <a href="/api/relatorios/export-csv" download className="inline-block rounded bg-primary px-4 py-2 text-sm text-primary-foreground">Baixar CSV</a>
      </div>
      <Card className="p-6">
        <h2 className="mb-4 font-semibold">Receita por dia (últimos 30 dias)</h2>
        {revenue.length === 0 ? <p className="text-muted-foreground">Sem dados.</p> : (
          <ul className="space-y-1 text-sm">
            {revenue.map((r) => <li key={r.day}>{r.day}: R$ {r.total ?? "0.00"}</li>)}
          </ul>
        )}
      </Card>
    </div>
  );
}
