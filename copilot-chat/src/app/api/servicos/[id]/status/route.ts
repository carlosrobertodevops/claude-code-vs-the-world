import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error, requireAuth, handleApiError } from "@/lib/api";
import { serviceOrderStatusSchema } from "@/lib/validations/service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const { status } = serviceOrderStatusSchema.parse(body);

    const order = await prisma.serviceOrder.findUnique({ where: { id } });
    if (!order) return error("Ordem nao encontrada", 404);

    const updateData: Record<string, unknown> = { status };
    if (status === "IN_PROGRESS") updateData.startedAt = new Date();
    if (status === "COMPLETED") updateData.completedAt = new Date();

    const updated = await prisma.serviceOrder.update({
      where: { id },
      data: updateData,
    });

    if (status === "COMPLETED" || status === "CANCELLED") {
      await prisma.queueEntry.deleteMany({ where: { serviceOrderId: id } });
    }

    return success(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
