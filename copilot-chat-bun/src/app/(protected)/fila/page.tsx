import Link from "next/link";

import { PageIntro } from "@/components/layout/page-intro";
import { DataTableCard } from "@/components/ui/data-table-card";
import { MetricGrid } from "@/components/ui/metric-grid";
import { StatusPill } from "@/components/ui/status-pill";
import { carWashConfig } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";
import { listQueueUseCase } from "@/server/domain/use-cases/list-operations-data.use-case";
import { operationsRepository } from "@/server/infrastructure/repositories/demo-operations.repository";

export default async function QueuePage() {
  const queue = await listQueueUseCase(operationsRepository);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Fila"
        title="Fila publica do lava-jato"
        description="A mesma fila abastece o acompanhamento interno e a visao do cliente."
      />

      <MetricGrid
        items={[
          { label: "Veiculos na fila", value: String(queue.length) },
          {
            label: "Em lavagem",
            value: String(queue.filter((item) => item.status === "WASHING").length),
          },
          {
            label: "Prontos",
            value: String(queue.filter((item) => item.status === "READY").length),
          },
          {
            label: "Slug publico",
            value: carWashConfig.slug,
          },
        ]}
      />

      <div className="flex justify-end">
        <Link
          href={`/fila/${carWashConfig.slug}`}
          className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-medium text-slate-950"
        >
          Abrir fila publica
        </Link>
      </div>

      <DataTableCard
        title="Sequencia de atendimento"
        subtitle="Atualize o progresso no patio e reflita para o cliente."
        data={queue}
        columns={[
          { key: "position", header: "Posicao", render: (item) => item.position },
          { key: "customer", header: "Cliente", render: (item) => item.customerName },
          { key: "vehicle", header: "Veiculo", render: (item) => item.vehicleLabel },
          {
            key: "status",
            header: "Status",
            render: (item) => <StatusPill value={item.status} />,
          },
          {
            key: "eta",
            header: "ETA",
            render: (item) => `${item.etaMinutes} min`,
          },
          {
            key: "updated",
            header: "Atualizado em",
            render: (item) => formatDate(item.updatedAt),
          },
        ]}
      />
    </div>
  );
}
