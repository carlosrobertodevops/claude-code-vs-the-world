import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/lib/dashboard";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visao geral da operacao"
        description="Acompanhe caixa, fila, estoque e servicos recentes num painel pensado para rotina real de lava-jato."
      >
        <Link href="/fila">
          <Button>Ver fila</Button>
        </Link>
        <Link href="/servicos">
          <Button variant="secondary">Nova OS</Button>
        </Link>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard eyebrow="Receita 30 dias" value={formatCurrency(data.monthlyRevenue)} helper="Somente ordens concluidas no periodo." />
        <StatCard eyebrow="Fila atual" value={String(data.waitingOrders)} helper={`${data.queueSize} entradas publicas ativas.`} />
        <StatCard eyebrow="Clientes" value={String(data.customers)} helper="Base pronta para recorrencia e fidelidade." />
        <StatCard eyebrow="Servicos concluidos" value={String(data.completedOrders)} helper="Indicador historico acumulado na base." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">Servico recente</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Ultimas ordens</h2>
            </div>
            <Link href="/servicos" className="text-sm font-semibold text-[var(--primary)]">Abrir modulo</Link>
          </div>

          <div className="mt-6 space-y-4">
            {data.recentOrders.length === 0 ? (
              <EmptyState title="Sem ordens de servico" description="Assim que a equipe criar novas OS, elas aparecerao aqui." />
            ) : (
              data.recentOrders.map((order) => (
                <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between" key={order.id}>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{order.orderNumber} • {order.customer.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{order.vehicle.brand} {order.vehicle.model} • {order.vehicle.plate}</p>
                    <p className="mt-1 text-xs text-slate-500">Criado em {formatDateTime(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(Number(order.totalAmount))}</span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">Estoque sensivel</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Itens que merecem atencao</h2>
          <div className="mt-6 space-y-4">
            {data.lowStock.map((product) => (
              <div className="rounded-3xl border border-slate-200 p-4" key={product.id}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">{product.name}</h3>
                  <span className="text-sm font-semibold text-amber-600">{Number(product.currentStock).toFixed(2)} {product.unit}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">Minimo ideal: {Number(product.minimumStock).toFixed(2)} {product.unit}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
