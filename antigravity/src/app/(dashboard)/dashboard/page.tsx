import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { SERVICE_ORDER_STATUS_LABELS, SERVICE_ORDER_STATUS_COLORS } from "@/lib/constants";
import { DashboardCharts } from "@/components/charts/dashboard-charts";
import {
  DollarSign,
  Car,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalCustomers,
    ordersThisMonth,
    ordersLastMonth,
    revenueThisMonth,
    revenueLastMonth,
    lowStockProducts,
    activeOrders,
    recentOrders,
    dailyRevenue,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.serviceOrder.count({
      where: { createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } },
    }),
    prisma.serviceOrder.count({
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        status: { not: "CANCELLED" },
      },
    }),
    prisma.serviceOrder.aggregate({
      where: { createdAt: { gte: startOfMonth }, status: "COMPLETED" },
      _sum: { totalAmount: true },
    }),
    prisma.serviceOrder.aggregate({
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        status: "COMPLETED",
      },
      _sum: { totalAmount: true },
    }),
    (prisma.$queryRaw`
      SELECT COUNT(*)::int as count FROM products
      WHERE "isActive" = true AND "currentStock" <= "minimumStock"
    ` as Promise<Array<{ count: number }>>).then((r) => r[0]?.count || 0),
    prisma.serviceOrder.count({
      where: { status: { in: ["WAITING", "IN_PROGRESS"] } },
    }),
    prisma.serviceOrder.findMany({
      where: { createdAt: { gte: startOfMonth } },
      include: {
        customer: true,
        vehicle: true,
        employee: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.$queryRaw`
      SELECT DATE("createdAt") as date, SUM("totalAmount") as total
      FROM service_orders
      WHERE "createdAt" >= ${startOfMonth} AND status = 'COMPLETED'
      GROUP BY DATE("createdAt")
      ORDER BY date
    ` as Promise<Array<{ date: Date; total: number }>>,
  ]);

  const revenue = revenueThisMonth._sum.totalAmount || 0;
  const lastRevenue = revenueLastMonth._sum.totalAmount || 0;
  const revenueChange = lastRevenue > 0 ? ((revenue - lastRevenue) / lastRevenue) * 100 : 0;
  const ordersChange = ordersLastMonth > 0 ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100 : 0;

  const kpis = [
    {
      title: "Faturamento do Mês",
      value: formatCurrency(revenue),
      change: revenueChange,
      icon: DollarSign,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Serviços no Mês",
      value: ordersThisMonth,
      change: ordersChange,
      icon: Car,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Total de Clientes",
      value: totalCustomers,
      icon: Users,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Em Atendimento",
      value: activeOrders,
      icon: Clock,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Visão geral do seu lava-jato
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.title}
            className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5 card-hover"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{kpi.title}</p>
                <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                {kpi.change !== undefined && (
                  <div className={`flex items-center gap-1 mt-1 text-xs ${kpi.change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    <TrendingUp className={`w-3 h-3 ${kpi.change < 0 ? "rotate-180" : ""}`} />
                    {Math.abs(kpi.change).toFixed(1)}% vs mês anterior
                  </div>
                )}
              </div>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.color}`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      {lowStockProducts > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>{lowStockProducts}</strong> produto(s) com estoque abaixo do mínimo.{" "}
            <a href="/inventario" className="underline font-medium">Ver inventário →</a>
          </p>
        </div>
      )}

      {/* Charts */}
      <DashboardCharts dailyRevenue={dailyRevenue.map(d => ({ date: String(d.date).split('T')[0], total: Number(d.total) }))} />

      {/* Recent Orders */}
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[hsl(var(--border))]">
          <h2 className="font-semibold">Últimos Serviços</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-[hsl(var(--muted-foreground))]">OS</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-[hsl(var(--muted-foreground))]">Cliente</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-[hsl(var(--muted-foreground))]">Veículo</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase text-[hsl(var(--muted-foreground))]">Status</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase text-[hsl(var(--muted-foreground))]">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-sm">{order.customer.name}</td>
                  <td className="px-4 py-3 text-sm">{order.vehicle.brand} {order.vehicle.model} - {order.vehicle.plate}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${SERVICE_ORDER_STATUS_COLORS[order.status]}`}>
                      {SERVICE_ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(order.totalAmount)}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
                    Nenhum serviço registrado este mês
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
