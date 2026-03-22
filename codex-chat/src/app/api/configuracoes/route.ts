import { UserRole } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { configSchema } from "@/lib/validations/config";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  if (session.user.role !== UserRole.MANAGER) return apiError("FORBIDDEN", "Acesso negado.", undefined, 403);
  const config = await prisma.carWashConfig.findFirst();
  return apiSuccess(config);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  if (session.user.role !== UserRole.MANAGER) return apiError("FORBIDDEN", "Acesso negado.", undefined, 403);
  const config = await prisma.carWashConfig.findFirst();
  if (!config) return apiError("NOT_FOUND", "Configuracao nao encontrada.", undefined, 404);

  const body = await request.json();
  const parsed = configSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Dados invalidos.", parsed.error.flatten(), 422);
  const updated = await prisma.carWashConfig.update({ where: { id: config.id }, data: parsed.data });
  return apiSuccess(updated);
}
