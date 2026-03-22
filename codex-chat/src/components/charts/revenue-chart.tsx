"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function RevenueChart({ data }: { data: Array<{ day: string; revenue: number }> }) {
  return (
    <Card>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">Receita</p>
        <h3 className="mt-2 text-2xl font-semibold text-slate-950">Ultimos 7 dias</h3>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#0b132b" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.06} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
            <XAxis dataKey="day" stroke="#64748b" />
            <YAxis stroke="#64748b" tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Area dataKey="revenue" type="monotone" stroke="#0b132b" fill="url(#revenueGradient)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
