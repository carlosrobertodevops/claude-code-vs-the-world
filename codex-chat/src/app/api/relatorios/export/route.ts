import { UserRole } from "@prisma/client";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/reports";
import { apiError } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);
  if (session.user.role !== UserRole.MANAGER) return apiError("FORBIDDEN", "Acesso negado.", undefined, 403);

  const type = new URL(request.url).searchParams.get("type") ?? "services";
  let csv = "";

  if (type === "customers") {
    const rows = await prisma.customer.findMany({ select: { name: true, phone: true, loyaltyPoints: true } });
    csv = toCsv(rows.map((row) => ({ nome: row.name, telefone: row.phone ?? "", pontos: row.loyaltyPoints })));
  } else {
    const rows = await prisma.serviceOrder.findMany({ include: { customer: true, vehicle: true } });
    csv = toCsv(rows.map((row) => ({ os: row.orderNumber, cliente: row.customer.name, placa: row.vehicle.plate, status: row.status, total: Number(row.totalAmount) })));
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}.csv"`,
    },
  });
}
