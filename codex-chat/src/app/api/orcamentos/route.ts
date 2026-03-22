import { auth } from "@/lib/auth";
import { nextSequence } from "@/lib/numbering";
import { prisma } from "@/lib/prisma";
import { quoteSchema } from "@/lib/validations/quote";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  const quotes = await prisma.quote.findMany({ include: { customer: true, items: { include: { serviceType: true } } } });
  return apiSuccess(quotes);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  const body = await request.json();
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Dados invalidos.", parsed.error.flatten(), 422);

  const [lastQuote, serviceType] = await Promise.all([
    prisma.quote.findFirst({ orderBy: { createdAt: "desc" }, select: { quoteNumber: true } }),
    prisma.serviceType.findUnique({ where: { id: parsed.data.serviceTypeId } }),
  ]);

  if (!serviceType) return apiError("NOT_FOUND", "Servico nao encontrado.", undefined, 404);

  const subtotal = Number(serviceType.basePrice) * parsed.data.quantity - parsed.data.discount;
  const quote = await prisma.quote.create({
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

  return apiSuccess(quote);
}
