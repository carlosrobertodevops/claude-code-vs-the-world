import { UserRole } from "@prisma/client";

import { auth } from "@/lib/auth";
import { nextSequence } from "@/lib/numbering";
import { prisma } from "@/lib/prisma";
import { contractSchema } from "@/lib/validations/contract";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  if (session.user.role !== UserRole.MANAGER) return apiError("FORBIDDEN", "Acesso negado.", undefined, 403);
  const contracts = await prisma.contract.findMany({ include: { customer: true } });
  return apiSuccess(contracts);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  if (session.user.role !== UserRole.MANAGER) return apiError("FORBIDDEN", "Acesso negado.", undefined, 403);
  const body = await request.json();
  const parsed = contractSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Dados invalidos.", parsed.error.flatten(), 422);

  const lastContract = await prisma.contract.findFirst({ orderBy: { createdAt: "desc" }, select: { contractNumber: true } });
  const contract = await prisma.contract.create({
    data: {
      customerId: parsed.data.customerId,
      contractNumber: nextSequence("CTR", lastContract?.contractNumber),
      status: parsed.data.status,
      title: parsed.data.title,
      content: parsed.data.content,
    },
  });
  return apiSuccess(contract);
}
