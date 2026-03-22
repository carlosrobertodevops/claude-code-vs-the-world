import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, generateOrderNumber } from "@/lib/utils";
import { createContractSchema, signContractSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);
    if (session.user.role !== "MANAGER") return errorResponse("FORBIDDEN", "Acesso negado", 403);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where = search
      ? {
          OR: [
            { contractNumber: { contains: search, mode: "insensitive" as const } },
            { title: { contains: search, mode: "insensitive" as const } },
            { customer: { name: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {};

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { customer: true },
      }),
      prisma.contract.count({ where }),
    ]);

    return successResponse(contracts, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao buscar contratos", 500, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);
    if (session.user.role !== "MANAGER") return errorResponse("FORBIDDEN", "Acesso negado", 403);

    const body = await req.json();
    const validation = createContractSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("VALIDATION", "Dados inválidos", 400, validation.error.flatten());
    }

    const count = await prisma.contract.count();
    const contractNumber = generateOrderNumber("CTR", count + 1);

    const contract = await prisma.contract.create({
      data: {
        ...validation.data,
        contractNumber,
      },
      include: { customer: true },
    });

    return successResponse(contract);
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao criar contrato", 500, error);
  }
}
