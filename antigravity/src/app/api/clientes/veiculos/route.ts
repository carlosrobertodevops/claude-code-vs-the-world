import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { createVehicleSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);

    const body = await req.json();
    const validation = createVehicleSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("VALIDATION", "Dados inválidos", 400, validation.error.flatten());
    }

    const existing = await prisma.vehicle.findUnique({ where: { plate: validation.data.plate } });
    if (existing) return errorResponse("DUPLICATE", "Placa já cadastrada", 400);

    const vehicle = await prisma.vehicle.create({
      data: validation.data,
    });

    return successResponse(vehicle);
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao criar veículo", 500, error);
  }
}
