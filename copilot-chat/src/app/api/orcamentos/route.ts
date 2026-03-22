import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error, requireAuth, handleApiError } from "@/lib/api";
import { quoteSchema, quoteStatusSchema } from "@/lib/validations/quote";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const quotes = await prisma.quote.findMany({
      where: status ? { status: status as never } : {},
      include: {
        customer: { select: { name: true, phone: true } },
        items: { include: { serviceType: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return success(quotes);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const body = await req.json();
    const data = quoteSchema.parse(body);

    const lastQuote = await prisma.quote.findFirst({
      orderBy: { createdAt: "desc" },
      select: { quoteNumber: true },
    });
    let nextNum = 1;
    if (lastQuote) {
      const match = lastQuote.quoteNumber.match(/ORC-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    const quoteNumber = `ORC-${String(nextNum).padStart(4, "0")}`;

    const items = data.items.map((item) => ({
      serviceTypeId: item.serviceTypeId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
      subtotal: item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100),
    }));

    const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

    const quote = await prisma.quote.create({
      data: {
        customerId: data.customerId,
        quoteNumber,
        totalAmount,
        notes: data.notes || null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        items: { create: items },
      },
      include: { customer: true, items: true },
    });

    return success(quote);
  } catch (err) {
    return handleApiError(err);
  }
}
