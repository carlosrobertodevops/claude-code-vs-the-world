import { ServiceOrderStatus } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recalculateQueue } from "@/lib/queue";
import { serviceStatusSchema } from "@/lib/validations/service";
import { apiError, apiSuccess } from "@/lib/utils";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  const { id } = await params;
  const body = await request.json();
  const parsed = serviceStatusSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Status invalido.", parsed.error.flatten(), 422);

  const order = await prisma.serviceOrder.update({
    where: { id },
    data: {
      status: parsed.data.status,
      startedAt: parsed.data.status === ServiceOrderStatus.IN_PROGRESS ? new Date() : undefined,
      completedAt: parsed.data.status === ServiceOrderStatus.COMPLETED ? new Date() : undefined,
    },
  });

  await recalculateQueue();
  return apiSuccess(order);
}
