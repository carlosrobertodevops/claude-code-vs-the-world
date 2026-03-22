import { UserRole } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/utils";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  if (session.user.role !== UserRole.MANAGER) return apiError("FORBIDDEN", "Acesso negado.", undefined, 403);
  const { id } = await params;
  const body = await request.json();
  const user = await prisma.user.update({ where: { id }, data: body });
  return apiSuccess(user);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  if (session.user.role !== UserRole.MANAGER) return apiError("FORBIDDEN", "Acesso negado.", undefined, 403);
  const { id } = await params;
  await prisma.user.delete({ where: { id } });
  return apiSuccess({ id });
}
