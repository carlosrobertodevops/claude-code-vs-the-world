import Link from "next/link";

import { PageIntro } from "@/components/layout/page-intro";
import { DataTableCard } from "@/components/ui/data-table-card";
import { MetricGrid } from "@/components/ui/metric-grid";
import { StatusPill } from "@/components/ui/status-pill";
import { formatCurrency, formatDate } from "@/lib/utils";
import { listQuotesUseCase } from "@/server/domain/use-cases/list-operations-data.use-case";
import { operationsRepository } from "@/server/infrastructure/repositories/demo-operations.repository";

export default async function QuotesPage() {
  const quotes = await listQuotesUseCase(operationsRepository);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Orcamentos"
        title="Propostas comerciais"
        description="Orcamentos com itens detalhados, validade e ponte para contratos."
      />

      <MetricGrid
        items={[
          { label: "Orcamentos ativos", value: String(quotes.length) },
          {
            label: "Valor em aberto",
            value: formatCurrency(quotes.reduce((sum, item) => sum + item.total, 0)),
          },
          {
            label: "Aprovados",
            value: String(quotes.filter((item) => item.status === "APPROVED").length),
          },
          { label: "Exportacao", value: "CSV + PDF" },
        ]}
      />

      <div className="flex justify-end">
        <Link
          href="/api/relatorios/csv"
          className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-medium text-slate-950"
        >
          Exportar CSV
        </Link>
      </div>

      <DataTableCard
        title="Lista de orcamentos"
        subtitle="Controle comercial do atendimento."
        data={quotes}
        columns={[
          { key: "customer", header: "Cliente", render: (item) => item.customerName },
          { key: "vehicle", header: "Veiculo", render: (item) => item.vehicleLabel },
          {
            key: "status",
            header: "Status",
            render: (item) => <StatusPill value={item.status} />,
          },
          {
            key: "validity",
            header: "Validade",
            render: (item) => formatDate(item.validUntil),
          },
          {
            key: "items",
            header: "Itens",
            render: (item) => item.items.map((quoteItem) => quoteItem.description).join(", "),
          },
          {
            key: "total",
            header: "Total",
            render: (item) => formatCurrency(item.total),
          },
        ]}
      />
    </div>
  );
}
