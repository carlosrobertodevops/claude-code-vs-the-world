"use client";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { SERVICE_ORDER_STATUS_LABELS } from "@/lib/constants";
import { Loader2, Download, DollarSign, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { csvExport } from "@/lib/utils";

const COLORS = ["hsl(210,100%,50%)", "hsl(160,60%,45%)", "hsl(30,80%,55%)", "hsl(280,65%,60%)", "hsl(340,75%,55%)"];

export default function RelatoriosPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    (async () => { setLoading(true); try { const res = await fetch(`/api/relatorios?period=${period}`); const json = await res.json(); if (json.success) setData(json.data); } finally { setLoading(false); } })();
  }, [period]);

  const exportCSV = () => {
    if (!data) return;
    const summary = data.summary as { totalRevenue: number; totalOrders: number; avgTicket: number };
    const csv = csvExport(["Métrica", "Valor"], [["Faturamento Total", formatCurrency(summary.totalRevenue)], ["Total de Serviços", String(summary.totalOrders)], ["Ticket Médio", formatCurrency(summary.avgTicket)]]);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `relatorio-${period}.csv`; a.click();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" /></div>;
  if (!data) return null;

  const summary = data.summary as { totalRevenue: number; totalOrders: number; avgTicket: number };
  const revenueByDay = data.revenueByDay as Array<{ date: string; total: number; count: number }>;
  const servicesByType = data.servicesByType as Array<{ name: string; count: number; revenue: number }>;
  const ordersByStatus = data.ordersByStatus as Array<{ status: string; count: number }>;
  const inventoryAlerts = data.inventoryAlerts as Array<{ name: string; currentStock: number; minimumStock: number }>;
  const topCustomers = data.topCustomers as Array<{ name: string; phone: string; _count: { serviceOrders: number } }>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Relatórios</h1><p className="text-sm text-[hsl(var(--muted-foreground))]">Análise de desempenho do lava-jato</p></div>
        <div className="flex gap-2">
          {["week", "month", "year"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${period === p ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))]"}`}>
              {p === "week" ? "Semana" : p === "month" ? "Mês" : "Ano"}
            </button>
          ))}
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted)/0.8)]"><Download className="w-3.5 h-3.5" /> CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[{ title: "Faturamento", value: formatCurrency(summary.totalRevenue), icon: DollarSign, color: "from-emerald-500 to-teal-600" },
          { title: "Serviços", value: summary.totalOrders, icon: ShoppingCart, color: "from-blue-500 to-indigo-600" },
          { title: "Ticket Médio", value: formatCurrency(summary.avgTicket), icon: TrendingUp, color: "from-purple-500 to-pink-600" }
        ].map(k => (
          <div key={k.title} className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5 card-hover">
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-[hsl(var(--muted-foreground))]">{k.title}</p><p className="text-2xl font-bold mt-1">{k.value}</p></div>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${k.color}`}><k.icon className="w-5 h-5 text-white" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <h3 className="font-semibold mb-4">Faturamento Diário</h3>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={revenueByDay.map(d => ({...d, date: d.date.slice(5)}))}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="date" fontSize={11} /><YAxis fontSize={11} /><Tooltip /><Bar dataKey="total" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>
        </div>
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <h3 className="font-semibold mb-4">Serviços por Tipo</h3>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={servicesByType} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`}>{servicesByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <h3 className="font-semibold mb-3">Top Clientes</h3>
          <div className="space-y-2">{topCustomers.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-[hsl(var(--muted)/0.3)]">
              <span className="text-sm">{c.name}</span><span className="text-sm font-medium">{c._count.serviceOrders} serviços</span>
            </div>
          ))}</div>
        </div>
        {inventoryAlerts.length > 0 && (
          <div className="bg-[hsl(var(--card))] border border-amber-200 dark:border-amber-800 rounded-xl p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Estoque Baixo</h3>
            <div className="space-y-2">{inventoryAlerts.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                <span className="text-sm">{p.name}</span><span className="text-sm text-red-600 dark:text-red-400 font-medium">{p.currentStock}/{p.minimumStock}</span>
              </div>
            ))}</div>
          </div>
        )}
      </div>
    </div>
  );
}
