import { buildQuotePdf } from "@/lib/pdf";
import { prisma } from "@/lib/prisma";
import { statusLabels } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { customer: true, items: { include: { serviceType: true } } },
  });
  const config = await prisma.carWashConfig.findFirst();

  if (!quote || !config) {
    return new Response("Nao encontrado", { status: 404 });
  }

  const buffer = await buildQuotePdf({
    businessName: config.businessName,
    quoteNumber: quote.quoteNumber,
    customerName: quote.customer.name,
    createdAt: formatDate(quote.createdAt),
    status: statusLabels[quote.status],
    totalAmount: Number(quote.totalAmount),
    items: quote.items.map((item) => ({
      description: item.serviceType.name,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
    })),
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quote.quoteNumber}.pdf"`,
    },
  });
}
