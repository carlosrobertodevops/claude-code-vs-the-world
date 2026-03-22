import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);

    const entries = await prisma.queueEntry.findMany({
      orderBy: { position: "asc" },
      include: {
        serviceOrder: {
          include: {
            customer: true,
            vehicle: true,
            employee: { select: { name: true } },
            items: { include: { serviceType: true } },
          },
        },
      },
    });

    return successResponse(entries);
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao buscar fila", 500, error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);

    const body = await req.json();
    const { entries } = body;

    if (!Array.isArray(entries)) {
      return errorResponse("VALIDATION", "Dados inválidos", 400);
    }

    await prisma.$transaction(
      entries.map((entry: { id: string; position: number }) =>
        prisma.queueEntry.update({
          where: { id: entry.id },
          data: { position: entry.position },
        })
      )
    );

    return successResponse({ message: "Fila atualizada" });
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao atualizar fila", 500, error);
  }
}
