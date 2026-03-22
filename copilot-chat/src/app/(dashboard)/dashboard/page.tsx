"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Car, TrendingUp, BarChart3, Clock, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQueue } from "@/hooks/use-queue";

type DashboardData = {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
};

type RevenueDay = { date: string; total: number };

export default function DashboardPage() {
  const { data: dashboard } = useQuery({
    queryKey: ["reports", "dashboard"],
    queryFn: () => apiGet("/api/relatorios/dashboard"),
  }) as { data: DashboardData | undefined };

  const { data: revenueData } = useQuery({
    queryKey: ["reports", "revenue", "30"],
    queryFn: () => apiGet("/api/relatorios/faturamento?period=30"),
  }) as { data: { byDay: RevenueDay[] } | undefined };

  const { data: queue = [] } = useQueue() as { data: { id: string }[] };

  const avgTicket = dashboard && dashboard.totalOrders > 0
    ? dashboard.totalRevenue / dashboard.totalOrders
    : 0;
  const completionRate = dashboard && dashboard.totalOrders > 0
    ? (dashboard.completedOrders / dashboard.totalOrders) * 100
    : 0;

  const kpis = [
    { label: "Faturamento (30d)", value: dashboard ? `R$ ${dashboard.totalRevenue.toFixed(2)}` : "-", icon: DollarSign, color: "text-green-600" },
    { label: "Ordens de Servico", value: dashboard?.totalOrders ?? "-", icon: Car, color: "text-blue-600" },
    { label: "Ticket Medio", value: dashboard ? `R$ ${avgTicket.toFixed(2)}` : "-", icon: TrendingUp, color: "text-purple-600" },
    { label: "Taxa de Conclusao", value: dashboard ? `${completionRate.toFixed(0)}%` : "-", icon: BarChart3, color: "text-orange-600" },
    { label: "Na Fila Agora", value: queue.length, icon: Clock, color: "text-cyan-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visao geral do lava-jato</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5 sm:grid-cols-2">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{k.label}</CardTitle>
              <k.icon className={`h-4 w-4 ${k.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Faturamento Diario (30 dias)</CardTitle></CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData?.byDay ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(v) => typeof v === "number" ? `R$ ${v.toFixed(2)}` : v} />
              <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
