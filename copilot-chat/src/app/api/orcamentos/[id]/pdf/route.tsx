import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/api";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuotePdf } from "@/lib/pdf";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        customer: { select: { name: true, phone: true, email: true } },
        items: { include: { serviceType: { select: { name: true } } } },
      },
    });
    if (!quote) return new Response("Not found", { status: 404 });

    const items = quote.items.map((i) => ({
      description: i.serviceType.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      discount: i.discount,
      subtotal: i.subtotal,
    }));

    const buffer = await renderToBuffer(
      <QuotePdf quote={{ ...quote, createdAt: quote.createdAt.toISOString(), items }} />
    );

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${quote.quoteNumber}.pdf"`,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
