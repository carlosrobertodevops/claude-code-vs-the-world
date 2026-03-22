import { notFound } from "next/navigation";

import { SignaturePad } from "@/components/shared/signature-pad";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PublicContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contract = await prisma.contract.findUnique({ include: { customer: true }, where: { id } });

  if (!contract) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary)]">Contrato digital</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{contract.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{contract.contractNumber} • {contract.customer.name}</p>
          <div className="mt-6 rounded-[28px] bg-slate-50 p-5 text-sm leading-7 text-slate-700">
            {contract.content}
          </div>
          <p className="mt-4 text-sm text-slate-500">Assinado em: {formatDate(contract.signedAt)}</p>
        </Card>

        {contract.status === "SIGNED" ? (
          <Card>
            <h2 className="text-2xl font-semibold text-slate-950">Contrato ja assinado</h2>
            <p className="mt-2 text-sm text-slate-600">Este documento foi concluido em {formatDate(contract.signedAt)}.</p>
          </Card>
        ) : (
          <SignaturePad contractId={contract.id} />
        )}
      </div>
    </main>
  );
}
