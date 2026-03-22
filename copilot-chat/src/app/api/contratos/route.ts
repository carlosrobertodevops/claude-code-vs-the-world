import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, requireRole, handleApiError } from "@/lib/api";
import { contractSchema } from "@/lib/validations/contract";

export async function GET() {
  try {
    await requireRole("MANAGER");
    const contracts = await prisma.contract.findMany({
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return success(contracts);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole("MANAGER");
    const body = await req.json();
    const data = contractSchema.parse(body);

    const lastContract = await prisma.contract.findFirst({
      orderBy: { createdAt: "desc" },
      select: { contractNumber: true },
    });
    let nextNum = 1;
    if (lastContract) {
      const match = lastContract.contractNumber.match(/CTR-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    const contractNumber = `CTR-${String(nextNum).padStart(4, "0")}`;

    const contract = await prisma.contract.create({
      data: { ...data, contractNumber },
      include: { customer: true },
    });
    return success(contract);
  } catch (err) {
    return handleApiError(err);
  }
}
