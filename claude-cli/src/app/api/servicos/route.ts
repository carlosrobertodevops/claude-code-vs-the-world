import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServiceOrderSchema } from "@/lib/validations/service";
import { ServiceOrderStatus } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ServiceOrderStatus | null;
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.serviceOrder.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          vehicle: { select: { id: true, plate: true, brand: true, model: true } },
          employee: { select: { id: true, name: true } },
          items: {
            include: {
              serviceType: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.serviceOrder.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error listing service orders:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao listar ordens de serviço" } },
      { status: 500 }
    );
  }
}

async function generateOrderNumber(): Promise<string> {
  const lastOrder = await prisma.serviceOrder.findFirst({
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  if (!lastOrder) {
    return "OS-0001";
  }

  const lastNumber = parseInt(lastOrder.orderNumber.replace("OS-", ""), 10);
  const nextNumber = lastNumber + 1;
  return `OS-${String(nextNumber).padStart(4, "0")}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createServiceOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Dados inválidos",
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Validate customer exists
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Cliente não encontrado" } },
        { status: 404 }
      );
    }

    // Validate vehicle belongs to customer
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: data.vehicleId, customerId: data.customerId },
    });
    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Veículo não encontrado para este cliente" } },
        { status: 404 }
      );
    }

    // Validate employee if provided
    if (data.employeeId) {
      const employee = await prisma.user.findUnique({ where: { id: data.employeeId } });
      if (!employee) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Funcionário não encontrado" } },
          { status: 404 }
        );
      }
    }

    const orderNumber = await generateOrderNumber();

    // Calculate total from items
    const items = data.items.map((item) => {
      const subtotal = item.quantity * item.unitPrice;
      return { ...item, subtotal };
    });
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    const order = await prisma.$transaction(async (tx) => {
      const serviceOrder = await tx.serviceOrder.create({
        data: {
          customerId: data.customerId,
          vehicleId: data.vehicleId,
          employeeId: data.employeeId || null,
          orderNumber,
          status: "WAITING",
          totalAmount,
          notes: data.notes || null,
          items: {
            create: items.map((item) => ({
              serviceTypeId: item.serviceTypeId || null,
              productId: item.productId || null,
              description: item.description || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
            })),
          },
        },
        include: {
          customer: { select: { id: true, name: true } },
          vehicle: { select: { id: true, plate: true, brand: true, model: true } },
          employee: { select: { id: true, name: true } },
          items: {
            include: {
              serviceType: { select: { id: true, name: true } },
            },
          },
        },
      });

      // Create queue entry since status is WAITING
      const maxPosition = await tx.queueEntry.findFirst({
        orderBy: { position: "desc" },
        select: { position: true },
      });

      await tx.queueEntry.create({
        data: {
          serviceOrderId: serviceOrder.id,
          position: (maxPosition?.position ?? 0) + 1,
        },
      });

      return serviceOrder;
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error("Error creating service order:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao criar ordem de serviço" } },
      { status: 500 }
    );
  }
}
