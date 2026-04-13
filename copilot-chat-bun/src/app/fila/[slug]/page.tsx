import { notFound } from "next/navigation";

import { PageIntro } from "@/components/layout/page-intro";
import { StatusPill } from "@/components/ui/status-pill";
import { carWashConfig } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";
import { getPublicQueueUseCase } from "@/server/domain/use-cases/get-public-queue.use-case";
import { operationsRepository } from "@/server/infrastructure/repositories/demo-operations.repository";

export default async function PublicQueuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug !== carWashConfig.slug) {
    notFound();
  }

  const { config, queue } = await getPublicQueueUseCase(operationsRepository, slug);

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <PageIntro
          eyebrow="Fila publica"
          title={config.name}
          description="Acompanhe seu veiculo em tempo real enquanto a equipe conclui a lavagem."
        />

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Fila atual", value: String(queue.length) },
            {
              label: "Em lavagem",
              value: String(queue.filter((item) => item.status === "WASHING").length),
            },
            { label: "Endereco", value: config.address },
          ].map((item) => (
            <article key={item.label} className="surface-strong rounded-[28px] p-5">
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-3 text-xl font-semibold text-white">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="surface-strong space-y-4 rounded-[28px] p-5">
          {queue.map((entry) => (
            <div key={entry.id} className="surface-soft flex flex-col gap-3 rounded-3xl p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-white">{entry.customerName}</p>
                <p className="text-sm text-slate-400">{entry.vehicleLabel}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill value={entry.status} />
                <p className="text-sm text-slate-400">Posicao {entry.position}</p>
                <p className="text-sm text-slate-400">ETA {entry.etaMinutes} min</p>
                <p className="text-sm text-slate-400">{formatDate(entry.updatedAt)}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
