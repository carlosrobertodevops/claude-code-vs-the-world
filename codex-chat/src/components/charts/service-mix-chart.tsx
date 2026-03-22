"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card } from "@/components/ui/card";

const COLORS = ["#0b132b", "#1d4ed8", "#38bdf8", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#475569"];

export function ServiceMixChart({ data }: { data: Array<{ name: string; total: number }> }) {
  return (
    <Card>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">Mix</p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-950">Servicos mais recorrentes</h3>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="name" outerRadius={110} innerRadius={52} paddingAngle={4}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
