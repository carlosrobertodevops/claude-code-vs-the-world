import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { createCustomerSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
            { cpfCnpj: { contains: search } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          vehicles: true,
          _count: { select: { serviceOrders: true } },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return successResponse(customers, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao buscar clientes", 500, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);

    const body = await req.json();
    const validation = createCustomerSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("VALIDATION", "Dados inválidos", 400, validation.error.flatten());
    }

    const data = { ...validation.data };
    if (!data.email) delete data.email;
    if (!data.cpfCnpj) delete data.cpfCnpj;
    if (!data.address) delete data.address;

    const customer = await prisma.customer.create({ data });
    return successResponse(customer);
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao criar cliente", 500, error);
  }
}
