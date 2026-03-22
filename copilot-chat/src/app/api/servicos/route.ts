import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, requireAuth, handleApiError } from "@/lib/api";
import { serviceOrderSchema } from "@/lib/validations/service";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search") || "";

    const where = {
      ...(status ? { status: status as never } : {}),
      ...(search
        ? {
            OR: [
              { orderNumber: { contains: search, mode: "insensitive" as const } },
              { customer: { name: { contains: search, mode: "insensitive" as const } } },
              { vehicle: { plate: { contains: search, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };

    const orders = await prisma.serviceOrder.findMany({
      where,
      include: {
        customer: { select: { name: true, phone: true } },
        vehicle: { select: { plate: true, brand: true, model: true } },
        employee: { select: { name: true } },
        items: true,
        _count: { select: { photos: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return success(orders);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const body = await req.json();
    const data = serviceOrderSchema.parse(body);

    const lastOrder = await prisma.serviceOrder.findFirst({
      orderBy: { createdAt: "desc" },
      select: { orderNumber: true },
    });

    let nextNum = 1;
    if (lastOrder) {
      const match = lastOrder.orderNumber.match(/OS-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    const orderNumber = `OS-${String(nextNum).padStart(4, "0")}`;

    const items = data.items.map((item) => ({
      serviceTypeId: item.serviceTypeId || null,
      productId: item.productId || null,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.quantity * item.unitPrice,
    }));

    const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

    const order = await prisma.serviceOrder.create({
      data: {
        customerId: data.customerId,
        vehicleId: data.vehicleId,
        employeeId: data.employeeId || null,
        orderNumber,
        totalAmount,
        notes: data.notes || null,
        items: { create: items },
      },
      include: { customer: true, vehicle: true, items: true },
    });

    // Create queue entry
    const maxPos = await prisma.queueEntry.aggregate({ _max: { position: true } });
    await prisma.queueEntry.create({
      data: {
        serviceOrderId: order.id,
        position: (maxPos._max.position || 0) + 1,
      },
    });

    return success(order);
  } catch (err) {
    return handleApiError(err);
  }
}
