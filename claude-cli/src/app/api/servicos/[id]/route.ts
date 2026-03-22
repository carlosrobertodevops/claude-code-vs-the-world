import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateServiceOrderStatusSchema } from "@/lib/validations/service";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const order = await prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        employee: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            serviceType: true,
            product: true,
          },
        },
        photos: { orderBy: { createdAt: "desc" } },
        queueEntry: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Ordem de serviço não encontrada" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching service order:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao buscar ordem de serviço" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateServiceOrderStatusSchema.safeParse(body);

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

    const existing = await prisma.serviceOrder.findUnique({
      where: { id },
      include: { queueEntry: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Ordem de serviço não encontrada" } },
        { status: 404 }
      );
    }

    const { status } = parsed.data;

    const order = await prisma.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = { status };

      if (status === "IN_PROGRESS") {
        updateData.startedAt = new Date();
      }

      if (status === "COMPLETED") {
        updateData.completedAt = new Date();
        // Remove queue entry
        if (existing.queueEntry) {
          await tx.queueEntry.delete({ where: { serviceOrderId: id } });
        }
      }

      if (status === "CANCELLED") {
        // Remove queue entry
        if (existing.queueEntry) {
          await tx.queueEntry.delete({ where: { serviceOrderId: id } });
        }
      }

      return tx.serviceOrder.update({
        where: { id },
        data: updateData,
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
    });

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Error updating service order:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao atualizar ordem de serviço" } },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await prisma.serviceOrder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Ordem de serviço não encontrada" } },
        { status: 404 }
      );
    }

    await prisma.serviceOrder.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Error deleting service order:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao excluir ordem de serviço" } },
      { status: 500 }
    );
  }
}
