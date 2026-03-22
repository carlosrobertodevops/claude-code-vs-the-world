"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardChartsProps {
  dailyRevenue: Array<{ date: string; total: number }>;
}

export function DashboardCharts({ dailyRevenue }: DashboardChartsProps) {
  const formattedData = dailyRevenue.map((d) => ({
    date: new Date(d.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    total: d.total,
  }));

  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
      <h2 className="font-semibold mb-4">Faturamento Diário</h2>
      {formattedData.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `R$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [
                  `R$ ${value.toFixed(2)}`,
                  "Faturamento",
                ]}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">
          Nenhum dado de faturamento este mês
        </div>
      )}
    </div>
  );
}
