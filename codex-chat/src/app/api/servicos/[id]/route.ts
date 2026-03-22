import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serviceOrderSchema } from "@/lib/validations/service";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  const { id } = await params;
  const order = await prisma.serviceOrder.findUnique({ where: { id }, include: { items: true, customer: true, vehicle: true, employee: true, queueEntry: true } });
  if (!order) return apiError("NOT_FOUND", "OS nao encontrada.", undefined, 404);
  return apiSuccess(order);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  const { id } = await params;
  const body = await request.json();
  const parsed = serviceOrderSchema.partial().safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Dados invalidos.", parsed.error.flatten(), 422);
  const order = await prisma.serviceOrder.update({ where: { id }, data: parsed.data });
  return apiSuccess(order);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  const { id } = await params;
  await prisma.serviceOrder.delete({ where: { id } });
  return apiSuccess({ id });
}
