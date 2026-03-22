import { prisma } from "@/lib/prisma";
import { contractSignatureSchema } from "@/lib/validations/contract";
import { apiError, apiSuccess } from "@/lib/utils";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = contractSignatureSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Assinatura invalida.", parsed.error.flatten(), 422);

  const contract = await prisma.contract.update({
    where: { id },
    data: {
      status: "SIGNED",
      signatureData: parsed.data.signatureData,
      signatureIp: request.headers.get("x-forwarded-for") ?? "local",
      signedAt: new Date(),
    },
  });

  return apiSuccess(contract);
}
