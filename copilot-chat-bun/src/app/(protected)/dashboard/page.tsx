import { BarChart3, ClipboardList, Package, Receipt, Waves, Wrench } from "lucide-react";

import { ReportsChart } from "@/components/dashboard/reports-chart";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { QueueQr } from "@/components/dashboard/queue-qr";
import { PageIntro } from "@/components/layout/page-intro";
import { StatusPill } from "@/components/ui/status-pill";
import { carWashConfig, reportRows } from "@/lib/demo-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getDashboardSummaryUseCase } from "@/server/domain/use-cases/get-dashboard-summary.use-case";
import {
  listQueueUseCase,
  listQuotesUseCase,
  listServiceOrdersUseCase,
} from "@/server/domain/use-cases/list-operations-data.use-case";
import { operationsRepository } from "@/server/infrastructure/repositories/demo-operations.repository";

export default async function DashboardPage() {
  const [summary, orders, queue, quotes] = await Promise.all([
    getDashboardSummaryUseCase(operationsRepository),
    listServiceOrdersUseCase(operationsRepository),
    listQueueUseCase(operationsRepository),
    listQuotesUseCase(operationsRepository),
  ]);

  const queueUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/fila/${carWashConfig.slug}`;

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Painel operacional"
        title="Visao geral do turno"
        description="Acompanhe receita, fila publica, estoque baixo e os fluxos mais importantes do lava-jato em tempo real."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Receita de hoje"
          value={formatCurrency(summary.revenueToday)}
          helper="Ordens concluidas e em andamento"
          icon={<Receipt className="h-5 w-5" />}
        />
        <StatCard
          label="Ordens abertas"
          value={String(summary.openOrders)}
          helper="Clientes em operacao no patio"
          icon={<Wrench className="h-5 w-5" />}
        />
        <StatCard
          label="Fila publica"
          value={String(summary.queueLength)}
          helper="Veiculos visiveis para o cliente"
          icon={<Waves className="h-5 w-5" />}
        />
        <StatCard
          label="Estoque em alerta"
          value={String(summary.lowStockItems)}
          helper="Itens abaixo do minimo"
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          label="Orcamentos pendentes"
          value={String(summary.pendingQuotes)}
          helper="Aguardando aprovacao"
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <StatCard
          label="Contratos assinados"
          value={String(summary.signedContracts)}
          helper="Base recorrente do mes"
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Ordens de servico em destaque"
          subtitle="As mais recentes para acompanhamento rapido da operacao."
        >
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="surface-soft flex flex-col gap-3 rounded-3xl p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-base font-medium text-white">{order.customerName}</p>
                  <p className="text-sm text-slate-400">
                    {order.vehicleLabel} · {order.employeeName}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill value={order.status} />
                  <span className="text-sm text-slate-400">
                    {formatDate(order.scheduledFor)}
                  </span>
                  <span className="text-sm font-medium text-white">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Fila publica via QR"
          subtitle="Cliente acompanha a lavagem direto no balcao."
        >
          <div className="flex flex-col items-center gap-4">
            <QueueQr url={queueUrl} />
            <p className="text-center text-sm text-slate-400">
              {queueUrl}
            </p>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Relatorio rapido"
          subtitle="Servicos mais vendidos do periodo."
        >
          <ReportsChart data={reportRows} />
        </SectionCard>
        <SectionCard
          title="Fila atual"
          subtitle="Atualizacao visivel para equipe e cliente."
        >
          <div className="space-y-3">
            {queue.map((entry) => (
              <div key={entry.id} className="surface-soft flex items-center justify-between rounded-3xl px-4 py-3">
                <div>
                  <p className="font-medium text-white">{entry.customerName}</p>
                  <p className="text-sm text-slate-400">{entry.vehicleLabel}</p>
                </div>
                <div className="text-right">
                  <StatusPill value={entry.status} />
                  <p className="mt-2 text-sm text-slate-400">
                    {entry.etaMinutes} min · pos. {entry.position}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Orcamentos recentes"
        subtitle="Acompanhe o que ainda precisa de aprovacao."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {quotes.map((quote) => (
            <div key={quote.id} className="surface-soft rounded-3xl p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-white">{quote.customerName}</p>
                <StatusPill value={quote.status} />
              </div>
              <p className="mt-2 text-sm text-slate-400">{quote.vehicleLabel}</p>
              <p className="mt-4 text-lg font-semibold text-white">
                {formatCurrency(quote.total)}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
