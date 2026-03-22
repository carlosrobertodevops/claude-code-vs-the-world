import { UserRole } from "@prisma/client";

import { auth } from "@/lib/auth";
import { getReportData } from "@/lib/reports";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  if (session.user.role !== UserRole.MANAGER) return apiError("FORBIDDEN", "Acesso negado.", undefined, 403);
  const report = await getReportData();
  return apiSuccess(report);
}
