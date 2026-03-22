import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recalculateQueue } from "@/lib/queue";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  const entries = await prisma.queueEntry.findMany({ include: { serviceOrder: { include: { customer: true, vehicle: true } } }, orderBy: { position: "asc" } });
  return apiSuccess(entries);
}

export async function POST() {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  const entries = await recalculateQueue();
  return apiSuccess(entries);
}
