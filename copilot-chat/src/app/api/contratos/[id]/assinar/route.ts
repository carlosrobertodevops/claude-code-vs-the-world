import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error, handleApiError } from "@/lib/api";
import { contractSignatureSchema } from "@/lib/validations/contract";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { signatureData } = contractSignatureSchema.parse(body);

    const contract = await prisma.contract.findUnique({ where: { id } });
    if (!contract) return error("Contrato nao encontrado", 404);
    if (contract.status !== "PENDING_SIGNATURE")
      return error("Contrato nao esta aguardando assinatura", 400);

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    const updated = await prisma.contract.update({
      where: { id },
      data: {
        signatureData,
        signatureIp: ip,
        signedAt: new Date(),
        status: "SIGNED",
      },
    });

    return success(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
