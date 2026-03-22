import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, generateOrderNumber } from "@/lib/utils";
import { createServiceOrderSchema, updateServiceOrderStatusSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
        { vehicle: { plate: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.serviceOrder.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          customer: true,
          vehicle: true,
          employee: { select: { id: true, name: true } },
          items: { include: { serviceType: true, product: true } },
          queueEntry: true,
        },
      }),
      prisma.serviceOrder.count({ where }),
    ]);

    return successResponse(orders, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao buscar ordens de serviço", 500, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);

    const body = await req.json();
    const validation = createServiceOrderSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("VALIDATION", "Dados inválidos", 400, validation.error.flatten());
    }

    const { items, ...orderData } = validation.data;

    // Generate order number
    const count = await prisma.serviceOrder.count();
    const orderNumber = generateOrderNumber("OS", count + 1);

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.serviceOrder.create({
        data: {
          ...orderData,
          orderNumber,
          totalAmount,
          status: "WAITING",
          items: {
            create: items.map((item) => ({
              serviceTypeId: item.serviceTypeId || null,
              productId: item.productId || null,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.unitPrice * item.quantity,
            })),
          },
        },
        include: {
          customer: true,
          vehicle: true,
          items: true,
        },
      });

      // Create queue entry
      const maxPosition = await tx.queueEntry.aggregate({ _max: { position: true } });
      await tx.queueEntry.create({
        data: {
          serviceOrderId: newOrder.id,
          position: (maxPosition._max.position || 0) + 1,
        },
      });

      return newOrder;
    });

    return successResponse(order);
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao criar ordem de serviço", 500, error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);

    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return errorResponse("VALIDATION", "ID é obrigatório", 400);

    const validation = updateServiceOrderStatusSchema.safeParse(rest);
    if (!validation.success) {
      return errorResponse("VALIDATION", "Dados inválidos", 400, validation.error.flatten());
    }

    const updateData: Record<string, unknown> = { status: validation.data.status };
    if (validation.data.status === "IN_PROGRESS") updateData.startedAt = new Date();
    if (validation.data.status === "COMPLETED") updateData.completedAt = new Date();

    const order = await prisma.serviceOrder.update({
      where: { id },
      data: updateData,
      include: { customer: true, vehicle: true },
    });

    // Remove from queue if completed or cancelled
    if (["COMPLETED", "CANCELLED"].includes(validation.data.status)) {
      await prisma.queueEntry.deleteMany({ where: { serviceOrderId: id } });
    }

    return successResponse(order);
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao atualizar status", 500, error);
  }
}
