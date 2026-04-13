import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { PageIntro } from "@/components/layout/page-intro";
import { DataTableCard } from "@/components/ui/data-table-card";
import { MetricGrid } from "@/components/ui/metric-grid";
import { StatusPill } from "@/components/ui/status-pill";
import { requireManager } from "@/lib/auth-guards";
import { formatCurrency, formatDate } from "@/lib/utils";
import { listContractsUseCase } from "@/server/domain/use-cases/list-operations-data.use-case";
import { operationsRepository } from "@/server/infrastructure/repositories/demo-operations.repository";

export default async function ContractsPage() {
  const session = await getServerSession(authOptions);
  requireManager(session);
  const contracts = await listContractsUseCase(operationsRepository);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Contratos"
        title="Contratos recorrentes"
        description="Gerencie contratos vinculados aos orcamentos aprovados e acompanhe assinaturas."
      />

      <MetricGrid
        items={[
          { label: "Contratos ativos", value: String(contracts.length) },
          {
            label: "Assinados",
            value: String(contracts.filter((item) => item.status === "SIGNED").length),
          },
          {
            label: "Valor contratado",
            value: formatCurrency(contracts.reduce((sum, item) => sum + item.quoteTotal, 0)),
          },
          { label: "Assinatura", value: "Digital" },
        ]}
      />

      <DataTableCard
        title="Carteira de contratos"
        subtitle="Visibilidade de renovacoes e pendencias."
        data={contracts}
        columns={[
          { key: "customer", header: "Cliente", render: (item) => item.customerName },
          {
            key: "status",
            header: "Status",
            render: (item) => <StatusPill value={item.status} />,
          },
          {
            key: "signedAt",
            header: "Assinado em",
            render: (item) => (item.signedAt ? formatDate(item.signedAt) : "Pendente"),
          },
          {
            key: "value",
            header: "Valor",
            render: (item) => formatCurrency(item.quoteTotal),
          },
          { key: "notes", header: "Observacoes", render: (item) => item.notes },
        ]}
      />
    </div>
  );
}
