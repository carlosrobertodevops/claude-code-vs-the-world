import { PageIntro } from "@/components/layout/page-intro";
import { DataTableCard } from "@/components/ui/data-table-card";
import { MetricGrid } from "@/components/ui/metric-grid";
import { StatusPill } from "@/components/ui/status-pill";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  listServiceOrdersUseCase,
  listServiceTypesUseCase,
} from "@/server/domain/use-cases/list-operations-data.use-case";
import { operationsRepository } from "@/server/infrastructure/repositories/demo-operations.repository";

export default async function ServicesPage() {
  const [orders, serviceTypes] = await Promise.all([
    listServiceOrdersUseCase(operationsRepository),
    listServiceTypesUseCase(operationsRepository),
  ]);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Servicos"
        title="Ordens de servico e catalogo"
        description="Controle o fluxo da lavagem, acompanhe responsavel e mantenha o cardapio de servicos atualizado."
      />

      <MetricGrid
        items={[
          { label: "Ordens no dia", value: String(orders.length) },
          { label: "Servicos disponiveis", value: String(serviceTypes.length) },
          {
            label: "Ticket medio",
            value: formatCurrency(
              orders.reduce((sum, item) => sum + item.total, 0) / orders.length,
            ),
          },
          {
            label: "Maior duracao",
            value: `${Math.max(...serviceTypes.map((item) => item.durationMinutes))} min`,
          },
        ]}
      />

      <DataTableCard
        title="Ordens de servico"
        subtitle="Execucao operacional com status e responsavel."
        data={orders}
        columns={[
          { key: "customer", header: "Cliente", render: (item) => item.customerName },
          { key: "vehicle", header: "Veiculo", render: (item) => item.vehicleLabel },
          { key: "employee", header: "Responsavel", render: (item) => item.employeeName },
          {
            key: "status",
            header: "Status",
            render: (item) => <StatusPill value={item.status} />,
          },
          {
            key: "schedule",
            header: "Agenda",
            render: (item) => formatDate(item.scheduledFor),
          },
          {
            key: "total",
            header: "Total",
            render: (item) => formatCurrency(item.total),
          },
        ]}
      />

      <DataTableCard
        title="Catalogo de servicos"
        subtitle="Base para orcamentos e contratos."
        data={serviceTypes}
        columns={[
          { key: "name", header: "Servico", render: (item) => item.name },
          {
            key: "description",
            header: "Descricao",
            render: (item) => item.description,
          },
          {
            key: "price",
            header: "Preco base",
            render: (item) => formatCurrency(item.basePrice),
          },
          {
            key: "duration",
            header: "Duracao",
            render: (item) => `${item.durationMinutes} min`,
          },
        ]}
      />
    </div>
  );
}
