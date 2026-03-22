import Image from "next/image";
import QRCode from "qrcode";
import { revalidatePath } from "next/cache";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { recalculateQueue } from "@/lib/queue";
import { formatDateTime } from "@/lib/utils";

export default async function QueuePage() {
  const [config, entries] = await Promise.all([
    prisma.carWashConfig.findFirst(),
    prisma.queueEntry.findMany({
      include: {
        serviceOrder: {
          include: {
            customer: true,
            vehicle: true,
          },
        },
      },
      orderBy: { position: "asc" },
    }),
  ]);

  async function refreshQueue() {
    "use server";
    await recalculateQueue();
    revalidatePath("/fila");
    revalidatePath("/dashboard");
  }

  const queueUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/fila/${config?.slug ?? "jatoflow-centro"}`;
  const qrCode = await QRCode.toDataURL(queueUrl, { margin: 1, width: 240 });

  return (
    <div className="space-y-6">
      <PageHeader title="Fila operacional" description="Fila publica e interna sincronizadas. A estimativa e recalculada conforme novas OS aguardando entram no fluxo.">
        <form action={refreshQueue}>
          <Button type="submit">Recalcular fila</Button>
        </form>
      </PageHeader>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="text-2xl font-semibold text-slate-950">Board da fila</h2>
          <div className="mt-6 space-y-4">
            {entries.map((entry) => (
              <div className="rounded-3xl border border-slate-200 p-4" key={entry.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">Posicao #{entry.position}</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">{entry.serviceOrder.vehicle.plate} • {entry.serviceOrder.customer.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{entry.serviceOrder.orderNumber}</p>
                  </div>
                  <StatusBadge status={entry.serviceOrder.status} />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p>Inicio estimado</p>
                    <p className="mt-1 font-semibold text-slate-900">{formatDateTime(entry.estimatedStart)}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p>Fim estimado</p>
                    <p className="mt-1 font-semibold text-slate-900">{formatDateTime(entry.estimatedEnd)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--primary)]">Fila publica</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Compartilhe por QR Code</h2>
          <Image alt="QR Code da fila publica" className="mt-6 rounded-[28px] border border-slate-200 bg-white p-4" height={240} src={qrCode} unoptimized width={240} />
          <p className="mt-4 break-all text-sm text-slate-600">{queueUrl}</p>
        </Card>
      </section>
    </div>
  );
}
