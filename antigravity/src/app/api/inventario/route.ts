import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { createProductSchema, stockMovementSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          movements: {
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { user: { select: { name: true } } },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return successResponse(products, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao buscar produtos", 500, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);

    const body = await req.json();
    const validation = createProductSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("VALIDATION", "Dados inválidos", 400, validation.error.flatten());
    }

    const product = await prisma.product.create({
      data: validation.data,
    });

    // Create initial stock movement if stock > 0
    if (validation.data.currentStock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          userId: session.user.id,
          type: "IN",
          quantity: validation.data.currentStock,
          unitCost: validation.data.costPrice,
          notes: "Estoque inicial",
        },
      });
    }

    return successResponse(product);
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao criar produto", 500, error);
  }
}
