import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { updateConfigSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);

    let config = await prisma.carWashConfig.findFirst();
    if (!config) {
      config = await prisma.carWashConfig.create({
        data: {
          businessName: "AquaWash Demo",
          slug: "aquawash-demo",
          simultaneousSlots: 2,
        },
      });
    }

    // Also return service types for forms
    const serviceTypes = await prisma.serviceType.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return successResponse({ config, serviceTypes });
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao buscar configurações", 500, error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);
    if (session.user.role !== "MANAGER") return errorResponse("FORBIDDEN", "Acesso negado", 403);

    const body = await req.json();
    const validation = updateConfigSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("VALIDATION", "Dados inválidos", 400, validation.error.flatten());
    }

    let config = await prisma.carWashConfig.findFirst();
    if (!config) {
      config = await prisma.carWashConfig.create({
        data: {
          businessName: "AquaWash Demo",
          slug: "aquawash-demo",
          simultaneousSlots: 2,
        },
      });
    }

    const updated = await prisma.carWashConfig.update({
      where: { id: config.id },
      data: validation.data,
    });

    return successResponse(updated);
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao atualizar configurações", 500, error);
  }
}
