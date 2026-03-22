import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userSchema } from "@/lib/validations/user";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  if (session.user.role !== UserRole.MANAGER) return apiError("FORBIDDEN", "Acesso negado.", undefined, 403);
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return apiSuccess(users);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  if (session.user.role !== UserRole.MANAGER) return apiError("FORBIDDEN", "Acesso negado.", undefined, 403);
  const body = await request.json();
  const parsed = userSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Dados invalidos.", parsed.error.flatten(), 422);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      role: parsed.data.role,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
    },
  });

  return apiSuccess(user);
}
