import { UserRole } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { contractSchema } from "@/lib/validations/contract";
import { apiError, apiSuccess } from "@/lib/utils";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  if (session.user.role !== UserRole.MANAGER) return apiError("FORBIDDEN", "Acesso negado.", undefined, 403);
  const { id } = await params;
  const body = await request.json();
  const parsed = contractSchema.partial().safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Dados invalidos.", parsed.error.flatten(), 422);
  const contract = await prisma.contract.update({ where: { id }, data: parsed.data });
  return apiSuccess(contract);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  if (session.user.role !== UserRole.MANAGER) return apiError("FORBIDDEN", "Acesso negado.", undefined, 403);
  const { id } = await params;
  await prisma.contract.delete({ where: { id } });
  return apiSuccess({ id });
}
