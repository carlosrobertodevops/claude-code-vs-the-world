"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, DollarSign, TrendingUp, Car, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#eab308", "#ef4444", "#8b5cf6", "#f97316", "#06b6d4", "#ec4899"];

function downloadCsv(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => String(row[h] ?? "")).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type RevenueDay = { date: string; total: number };
type RevenueEmployee = { employee: string; total: number; count: number };
type ServiceStatus = { status: string; count: number };
type TopService = { name: string; count: number; revenue: number };

export default function RelatoriosPage() {
  const [period, setPeriod] = useState("30");

  const { data: revenueData } = useQuery({
    queryKey: ["reports", "revenue", period],
    queryFn: () => apiGet(`/api/relatorios/faturamento?period=${period}`),
  }) as { data: { byDay: RevenueDay[]; byEmployee: RevenueEmployee[] } | undefined };

  const { data: serviceData } = useQuery({
    queryKey: ["reports", "services", period],
    queryFn: () => apiGet(`/api/relatorios/servicos?period=${period}`),
  }) as { data: { byStatus: ServiceStatus[]; topServices: TopService[] } | undefined };

  const { data: dashboard } = useQuery({
    queryKey: ["reports", "dashboard"],
    queryFn: () => apiGet("/api/relatorios/dashboard"),
  }) as { data: { totalRevenue: number; totalOrders: number; completedOrders: number } | undefined };

  const avgTicket = dashboard && dashboard.totalOrders > 0
    ? dashboard.totalRevenue / dashboard.totalOrders
    : 0;
  const completionRate = dashboard && dashboard.totalOrders > 0
    ? (dashboard.completedOrders / dashboard.totalOrders) * 100
    : 0;

  const kpis = [
    { label: "Faturamento", value: dashboard ? `R$ ${dashboard.totalRevenue.toFixed(2)}` : "-", icon: DollarSign },
    { label: "Total OS", value: dashboard?.totalOrders ?? "-", icon: Car },
    { label: "Ticket Medio", value: dashboard ? `R$ ${avgTicket.toFixed(2)}` : "-", icon: TrendingUp },
    { label: "Taxa Conclusao", value: dashboard ? `${completionRate.toFixed(0)}%` : "-", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Relatorios</h1>
          <p className="text-muted-foreground">Analises e metricas do negocio</p>
        </div>
        <Select value={period} onValueChange={(v) => v && setPeriod(v)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Ultimos 7 dias</SelectItem>
            <SelectItem value="30">Ultimos 30 dias</SelectItem>
            <SelectItem value="90">Ultimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{k.label}</CardTitle><k.icon className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{k.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Faturamento</TabsTrigger>
          <TabsTrigger value="services">Servicos</TabsTrigger>
          <TabsTrigger value="employees">Funcionarios</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Faturamento por Dia</CardTitle>
              <Button variant="outline" size="sm" onClick={() => revenueData?.byDay && downloadCsv(revenueData.byDay as unknown as Record<string, unknown>[], "faturamento-diario")}>
                <Download className="mr-2 h-4 w-4" /> CSV
              </Button>
            </CardHeader>
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
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Status das OS</CardTitle>
                <Button variant="outline" size="sm" onClick={() => serviceData?.byStatus && downloadCsv(serviceData.byStatus as unknown as Record<string, unknown>[], "os-status")}>
                  <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={serviceData?.byStatus ?? []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label>
                      {(serviceData?.byStatus ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Servicos Mais Realizados</CardTitle>
                <Button variant="outline" size="sm" onClick={() => serviceData?.topServices && downloadCsv(serviceData.topServices as unknown as Record<string, unknown>[], "top-servicos")}>
                  <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceData?.topServices ?? []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#16a34a" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Faturamento por Funcionario</CardTitle>
              <Button variant="outline" size="sm" onClick={() => revenueData?.byEmployee && downloadCsv(revenueData.byEmployee as unknown as Record<string, unknown>[], "faturamento-funcionarios")}>
                <Download className="mr-2 h-4 w-4" /> CSV
              </Button>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData?.byEmployee ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="employee" />
                  <YAxis />
                  <Tooltip formatter={(v) => typeof v === "number" ? `R$ ${v.toFixed(2)}` : v} />
                  <Bar dataKey="total" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
