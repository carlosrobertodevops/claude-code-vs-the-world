import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils";
import { signContractSchema } from "@/lib/validations";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validation = signContractSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("VALIDATION", "Dados inválidos", 400, validation.error.flatten());
    }

    const contract = await prisma.contract.findUnique({ where: { id } });
    if (!contract) return errorResponse("NOT_FOUND", "Contrato não encontrado", 404);
    if (contract.status !== "PENDING_SIGNATURE") {
      return errorResponse("INVALID_STATUS", "Contrato não está aguardando assinatura", 400);
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    const updated = await prisma.contract.update({
      where: { id },
      data: {
        signatureData: validation.data.signatureData,
        signatureIp: ip,
        signedAt: new Date(),
        status: "SIGNED",
      },
    });

    return successResponse(updated);
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao assinar contrato", 500, error);
  }
}
