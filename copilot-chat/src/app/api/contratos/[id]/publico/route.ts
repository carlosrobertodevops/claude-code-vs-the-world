import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contract = await prisma.contract.findUnique({
      where: { id },
      select: {
        id: true,
        contractNumber: true,
        title: true,
        content: true,
        status: true,
        customer: { select: { name: true } },
      },
    });
    if (!contract) return error("Contrato nao encontrado", 404);
    return success(contract);
  } catch (err) {
    console.error(err);
    return error("Erro interno", 500);
  }
}
