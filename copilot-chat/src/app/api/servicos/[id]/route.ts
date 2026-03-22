import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error, requireAuth, handleApiError } from "@/lib/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const order = await prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        employee: { select: { name: true } },
        items: { include: { serviceType: true, product: true } },
        photos: true,
        queue: true,
      },
    });
    if (!order) return error("Ordem de servico nao encontrada", 404);
    return success(order);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    await prisma.serviceOrder.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
    await prisma.queueEntry.deleteMany({ where: { serviceOrderId: id } });
    return success({ cancelled: true });
  } catch (err) {
    return handleApiError(err);
  }
}
