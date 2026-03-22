import Link from "next/link";
import { QuoteStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { nextSequence } from "@/lib/numbering";
import { prisma } from "@/lib/prisma";
import { quoteSchema } from "@/lib/validations/quote";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function QuotesPage() {
  const [quotes, customers, serviceTypes] = await Promise.all([
    prisma.quote.findMany({ include: { customer: true, items: { include: { serviceType: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.serviceType.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  async function createQuote(formData: FormData) {
    "use server";

    const parsed = quoteSchema.safeParse({
      customerId: formData.get("customerId"),
      serviceTypeId: formData.get("serviceTypeId"),
      quantity: formData.get("quantity"),
      discount: formData.get("discount"),
      status: formData.get("status"),
      notes: formData.get("notes") || undefined,
    });

    if (!parsed.success) return;

    const [lastQuote, serviceType] = await Promise.all([
      prisma.quote.findFirst({ orderBy: { createdAt: "desc" }, select: { quoteNumber: true } }),
      prisma.serviceType.findUnique({ where: { id: parsed.data.serviceTypeId } }),
    ]);

    if (!serviceType) return;

    const subtotal = Number(serviceType.basePrice) * parsed.data.quantity - parsed.data.discount;

    await prisma.quote.create({
      data: {
        customerId: parsed.data.customerId,
        quoteNumber: nextSequence("ORC", lastQuote?.quoteNumber),
        status: parsed.data.status,
        notes: parsed.data.notes,
        totalAmount: subtotal,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        items: {
          create: {
            serviceTypeId: serviceType.id,
            quantity: parsed.data.quantity,
            unitPrice: serviceType.basePrice,
            discount: parsed.data.discount,
            subtotal,
          },
        },
      },
    });

    revalidatePath("/orcamentos");
  }

  async function updateStatus(formData: FormData) {
    "use server";
    await prisma.quote.update({
      where: { id: String(formData.get("quoteId")) },
      data: { status: formData.get("status") as QuoteStatus },
    });
    revalidatePath("/orcamentos");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Orcamentos" description="Monte propostas rapidamente, acompanhe status comercial e gere PDF para envio ao cliente." />

      <Card>
        <h2 className="text-xl font-semibold text-slate-950">Novo orcamento</h2>
        <form action={createQuote} className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <select className="h-11 rounded-2xl border border-slate-200 px-4" name="customerId" required>
            <option value="">Cliente</option>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
          </select>
          <select className="h-11 rounded-2xl border border-slate-200 px-4" name="serviceTypeId" required>
            <option value="">Servico</option>
            {serviceTypes.map((serviceType) => <option key={serviceType.id} value={serviceType.id}>{serviceType.name}</option>)}
          </select>
          <Input defaultValue="1" min="1" name="quantity" type="number" />
          <Input defaultValue="0" min="0" name="discount" placeholder="Desconto" step="0.01" type="number" />
          <select className="h-11 rounded-2xl border border-slate-200 px-4" defaultValue="DRAFT" name="status">
            <option value="DRAFT">Rascunho</option>
            <option value="SENT">Enviado</option>
            <option value="APPROVED">Aprovado</option>
            <option value="REJECTED">Recusado</option>
            <option value="EXPIRED">Expirado</option>
          </select>
          <Input className="xl:col-span-3" name="notes" placeholder="Observacoes" />
          <Button className="xl:col-span-3" type="submit">Criar orcamento</Button>
        </form>
      </Card>

      <section className="grid gap-4">
        {quotes.map((quote) => (
          <Card key={quote.id}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-semibold text-slate-950">{quote.quoteNumber}</h3>
                  <StatusBadge status={quote.status} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{quote.customer.name} • validade {formatDate(quote.expiresAt)}</p>
                <p className="mt-1 text-sm text-slate-500">{quote.items.map((item) => item.serviceType.name).join(", ")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-lg font-semibold text-slate-900">{formatCurrency(Number(quote.totalAmount))}</span>
                <Link href={`/api/orcamentos/${quote.id}/pdf`}>
                  <Button variant="secondary">PDF</Button>
                </Link>
                <form action={updateStatus}>
                  <input name="quoteId" type="hidden" value={quote.id} />
                  <input name="status" type="hidden" value="APPROVED" />
                  <Button type="submit">Aprovar</Button>
                </form>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
