"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useRevenueReport,
  useServicesReport,
  useInventoryReport,
  useCustomersReport,
} from "@/hooks/use-reports";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateLabel(dateStr: string): string {
  const parts = dateStr.split("-");
  return `${parts[2]}/${parts[1]}`;
}

function RevenueTab() {
  const { data, isLoading } = useRevenueReport();

  if (isLoading) {
    return <Skeleton className="h-80 w-full rounded-xl" />;
  }

  if (!data) {
    return <p className="text-muted-foreground">Nenhum dado disponivel.</p>;
  }

  const chartData = data.dailyRevenue.map((d) => ({
    date: formatDateLabel(d.date),
    total: d.total,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento Total (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ordens Concluidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.orderCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faturamento Diario</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
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
    </div>
  );
}

function ServicesTab() {
  const { data, isLoading } = useServicesReport();

  if (isLoading) {
    return <Skeleton className="h-80 w-full rounded-xl" />;
  }

  if (!data || data.topServices.length === 0) {
    return <p className="text-muted-foreground">Nenhum dado disponivel.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Servicos Mais Realizados (30 dias)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data.topServices} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `R$${value}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={150}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), "Faturamento"]}
            />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function InventoryTab() {
  const { data, isLoading } = useInventoryReport();

  if (isLoading) {
    return <Skeleton className="h-60 w-full rounded-xl" />;
  }

  if (!data || data.lowStockProducts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nenhum produto com estoque baixo.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos com Estoque Baixo</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="text-right">Estoque Atual</TableHead>
              <TableHead className="text-right">Estoque Minimo</TableHead>
              <TableHead className="text-right">Custo Unit.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.lowStockProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell className="text-right text-red-600 font-medium">
                  {product.currentStock}
                </TableCell>
                <TableCell className="text-right">{product.minimumStock}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(product.costPrice)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CustomersTab() {
  const { data, isLoading } = useCustomersReport();

  if (isLoading) {
    return <Skeleton className="h-60 w-full rounded-xl" />;
  }

  if (!data || data.topCustomers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nenhum dado de clientes disponivel.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Melhores Clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="text-right">Ordens</TableHead>
              <TableHead className="text-right">Total Gasto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.topCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell className="text-right">{customer.orderCount}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(customer.totalSpent)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("revenue");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Relatorios</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="revenue">Faturamento</TabsTrigger>
          <TabsTrigger value="services">Servicos</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <RevenueTab />
        </TabsContent>
        <TabsContent value="services">
          <ServicesTab />
        </TabsContent>
        <TabsContent value="inventory">
          <InventoryTab />
        </TabsContent>
        <TabsContent value="customers">
          <CustomersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
