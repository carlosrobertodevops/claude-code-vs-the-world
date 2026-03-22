import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error, requireRole, handleApiError } from "@/lib/api";
import { contractStatusSchema } from "@/lib/validations/contract";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("MANAGER");
    const { id } = await params;
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!contract) return error("Contrato nao encontrado", 404);
    return success(contract);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("MANAGER");
    const { id } = await params;
    const body = await req.json();
    const { status } = contractStatusSchema.parse(body);
    const contract = await prisma.contract.update({
      where: { id },
      data: { status },
    });
    return success(contract);
  } catch (err) {
    return handleApiError(err);
  }
}
