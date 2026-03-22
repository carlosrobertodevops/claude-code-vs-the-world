"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ClipboardList, Users, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { STATUS_LABELS } from "@/lib/constants";

interface DashboardData {
  monthRevenue: number;
  todayOrders: number;
  queueCount: number;
  lowStockCount: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    customerName: string;
    createdAt: string;
  }>;
  weeklyRevenue: Array<{
    date: string;
    total: number;
  }>;
}

async function fetchDashboardData(): Promise<DashboardData> {
  const [revenueRes, queueRes, inventoryRes, ordersRes] = await Promise.all([
    fetch("/api/relatorios?type=revenue"),
    fetch("/api/fila"),
    fetch("/api/relatorios?type=inventory"),
    fetch("/api/servicos?limit=5&sortBy=createdAt&sortOrder=desc").catch(
      () => null
    ),
  ]);

  // Revenue data
  let monthRevenue = 0;
  let weeklyRevenue: Array<{ date: string; total: number }> = [];
  if (revenueRes.ok) {
    const revenueJson = await revenueRes.json();
    const revenueData = revenueJson.data;
    monthRevenue = revenueData?.totalRevenue ?? 0;
    const daily = (revenueData?.dailyRevenue ?? []) as Array<{
      date: string;
      total: number;
    }>;
    // Last 7 days
    weeklyRevenue = daily.slice(-7).map((d) => ({
      date: d.date.split("-").slice(1).join("/"),
      total: d.total,
    }));
  }

  // Queue count
  let queueCount = 0;
  if (queueRes.ok) {
    const queueJson = await queueRes.json();
    queueCount = Array.isArray(queueJson.data) ? queueJson.data.length : 0;
  }

  // Low stock count
  let lowStockCount = 0;
  if (inventoryRes.ok) {
    const invJson = await inventoryRes.json();
    lowStockCount = invJson.data?.lowStockProducts?.length ?? 0;
  }

  // Recent orders and today count: we'll use a simple approach
  // Fetch recent service orders from a custom endpoint or compute from revenue data
  let todayOrders = 0;
  let recentOrders: DashboardData["recentOrders"] = [];

  if (ordersRes && ordersRes.ok) {
    const ordersJson = await ordersRes.json();
    recentOrders = (ordersJson.data || []).map(
      (o: {
        id: string;
        orderNumber: string;
        status: string;
        totalAmount: number;
        customer?: { name: string };
        createdAt: string;
      }) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        totalAmount: o.totalAmount,
        customerName: o.customer?.name ?? "Cliente",
        createdAt: o.createdAt,
      })
    );
    const today = new Date().toISOString().split("T")[0];
    todayOrders = recentOrders.filter((o) =>
      o.createdAt.startsWith(today)
    ).length;
  }

  return {
    monthRevenue,
    todayOrders,
    queueCount,
    lowStockCount,
    recentOrders,
    weeklyRevenue,
  };
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const statusVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  WAITING: "secondary",
  IN_PROGRESS: "default",
  COMPLETED: "outline",
  CANCELLED: "destructive",
};

export function DashboardContent() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const kpis = [
    {
      title: "Faturamento do Mes",
      value: formatCurrency(data?.monthRevenue ?? 0),
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Ordens Hoje",
      value: String(data?.todayOrders ?? 0),
      icon: ClipboardList,
      color: "text-blue-600",
    },
    {
      title: "Na Fila",
      value: String(data?.queueCount ?? 0),
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Estoque Baixo",
      value: String(data?.lowStockCount ?? 0),
      icon: AlertTriangle,
      color: data?.lowStockCount && data.lowStockCount > 0 ? "text-red-600" : "text-gray-600",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      {data?.weeklyRevenue && data.weeklyRevenue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Faturamento (Ultimos 7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.weeklyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => `R$${value}`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), "Faturamento"]}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      {data?.recentOrders && data.recentOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ordens Recentes</CardTitle>
            <CardDescription>Ultimas ordens de servico</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.customerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariantMap[order.status] || "secondary"}>
                      {STATUS_LABELS[order.status] || order.status}
                    </Badge>
                    <span className="text-sm font-medium">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
