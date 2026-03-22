import { ServiceOrderStatus } from "@prisma/client";

import { auth } from "@/lib/auth";
import { nextSequence } from "@/lib/numbering";
import { prisma } from "@/lib/prisma";
import { recalculateQueue } from "@/lib/queue";
import { serviceOrderSchema } from "@/lib/validations/service";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  const orders = await prisma.serviceOrder.findMany({ include: { customer: true, vehicle: true, employee: true, queueEntry: true } });
  return apiSuccess(orders);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  const body = await request.json();
  const parsed = serviceOrderSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Dados invalidos.", parsed.error.flatten(), 422);

  const [lastOrder, serviceType, product] = await Promise.all([
    prisma.serviceOrder.findFirst({ orderBy: { createdAt: "desc" }, select: { orderNumber: true } }),
    prisma.serviceType.findUnique({ where: { id: parsed.data.serviceTypeId } }),
    parsed.data.productId ? prisma.product.findUnique({ where: { id: parsed.data.productId } }) : Promise.resolve(null),
  ]);

  if (!serviceType) return apiError("NOT_FOUND", "Servico nao encontrado.", undefined, 404);

  const servicePrice = Number(serviceType.basePrice);
  const productPrice = product ? Number(product.costPrice) * 1.7 : 0;
  const total = servicePrice + productPrice;

  const order = await prisma.serviceOrder.create({
    data: {
      customerId: parsed.data.customerId,
      vehicleId: parsed.data.vehicleId,
      employeeId: parsed.data.employeeId || null,
      orderNumber: nextSequence("OS", lastOrder?.orderNumber),
      status: parsed.data.status,
      totalAmount: total,
      startedAt: parsed.data.status === ServiceOrderStatus.WAITING ? null : new Date(),
      completedAt: parsed.data.status === ServiceOrderStatus.COMPLETED ? new Date() : null,
      notes: parsed.data.notes,
      items: {
        create: [
          {
            serviceTypeId: serviceType.id,
            description: serviceType.name,
            quantity: 1,
            unitPrice: servicePrice,
            subtotal: servicePrice,
          },
          ...(product
            ? [{ productId: product.id, description: `Uso interno de ${product.name}`, quantity: 1, unitPrice: productPrice, subtotal: productPrice }]
            : []),
        ],
      },
    },
  });

  await recalculateQueue();
  return apiSuccess(order);
}
