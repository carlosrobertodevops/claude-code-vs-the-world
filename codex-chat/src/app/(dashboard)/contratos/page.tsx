import Link from "next/link";
import { ContractStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { nextSequence } from "@/lib/numbering";
import { requireManagerPage } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { contractSchema } from "@/lib/validations/contract";
import { formatDate } from "@/lib/utils";

export default async function ContractsPage() {
  await requireManagerPage();
  const [contracts, customers] = await Promise.all([
    prisma.contract.findMany({ include: { customer: true }, orderBy: { createdAt: "desc" } }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
  ]);

  async function createContract(formData: FormData) {
    "use server";

    const parsed = contractSchema.safeParse({
      customerId: formData.get("customerId"),
      title: formData.get("title"),
      content: formData.get("content"),
      status: formData.get("status"),
    });

    if (!parsed.success) return;

    const lastContract = await prisma.contract.findFirst({ orderBy: { createdAt: "desc" }, select: { contractNumber: true } });

    await prisma.contract.create({
      data: {
        customerId: parsed.data.customerId,
        contractNumber: nextSequence("CTR", lastContract?.contractNumber),
        status: parsed.data.status,
        title: parsed.data.title,
        content: parsed.data.content,
      },
    });

    revalidatePath("/contratos");
  }

  async function updateStatus(formData: FormData) {
    "use server";
    await prisma.contract.update({
      where: { id: String(formData.get("contractId")) },
      data: { status: formData.get("status") as ContractStatus },
    });
    revalidatePath("/contratos");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Contratos" description="Formalize planos recorrentes, acompanhe assinaturas e gere PDF para arquivo ou envio ao cliente." />

      <Card>
        <h2 className="text-xl font-semibold text-slate-950">Novo contrato</h2>
        <form action={createContract} className="mt-6 grid gap-4">
          <select className="h-11 rounded-2xl border border-slate-200 px-4" name="customerId" required>
            <option value="">Cliente</option>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
          </select>
          <Input name="title" placeholder="Titulo do contrato" required />
          <Textarea name="content" placeholder="Conteudo do contrato" required />
          <select className="h-11 rounded-2xl border border-slate-200 px-4" defaultValue="DRAFT" name="status">
            <option value="DRAFT">Rascunho</option>
            <option value="PENDING_SIGNATURE">Aguardando assinatura</option>
            <option value="SIGNED">Assinado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
          <Button type="submit">Criar contrato</Button>
        </form>
      </Card>

      <section className="grid gap-4">
        {contracts.map((contract) => (
          <Card key={contract.id}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-semibold text-slate-950">{contract.contractNumber}</h3>
                  <StatusBadge status={contract.status} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{contract.customer.name} • {contract.title}</p>
                <p className="mt-1 text-sm text-slate-500">Assinado em {formatDate(contract.signedAt)}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={`/contratos/${contract.id}`}>
                  <Button variant="secondary">Pagina de assinatura</Button>
                </Link>
                <Link href={`/api/contratos/${contract.id}/pdf`}>
                  <Button variant="secondary">PDF</Button>
                </Link>
                <form action={updateStatus}>
                  <input name="contractId" type="hidden" value={contract.id} />
                  <input name="status" type="hidden" value="PENDING_SIGNATURE" />
                  <Button type="submit">Enviar para assinatura</Button>
                </form>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
