import { PageIntro } from "@/components/layout/page-intro";
import { DataTableCard } from "@/components/ui/data-table-card";
import { MetricGrid } from "@/components/ui/metric-grid";
import { listCustomersUseCase } from "@/server/domain/use-cases/list-operations-data.use-case";
import { operationsRepository } from "@/server/infrastructure/repositories/demo-operations.repository";

export default async function CustomersPage() {
  const customers = await listCustomersUseCase(operationsRepository);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Clientes"
        title="Base de clientes e veiculos"
        description="Cadastros centralizados para agilizar orcamentos, contratos e ordens de servico."
      />

      <MetricGrid
        items={[
          { label: "Clientes ativos", value: String(customers.length) },
          {
            label: "Veiculos vinculados",
            value: String(customers.reduce((sum, item) => sum + item.vehicles.length, 0)),
          },
          {
            label: "Canais de contato",
            value: "WhatsApp + Email",
            helper: "Fluxo pronto para follow-up comercial",
          },
          {
            label: "Cadastro completo",
            value: "100%",
            helper: "Documento, telefone e endereco",
          },
        ]}
      />

      <DataTableCard
        title="Clientes cadastrados"
        subtitle="Visao unica do historico de atendimento."
        data={customers}
        columns={[
          { key: "name", header: "Cliente", render: (item) => item.name },
          { key: "document", header: "Documento", render: (item) => item.document },
          { key: "phone", header: "Telefone", render: (item) => item.phone },
          { key: "email", header: "Email", render: (item) => item.email },
          {
            key: "vehicles",
            header: "Veiculos",
            render: (item) => (
              <div className="space-y-1">
                {item.vehicles.map((vehicle) => (
                  <p key={vehicle.id}>
                    {vehicle.brand} {vehicle.model} · {vehicle.plate}
                  </p>
                ))}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
