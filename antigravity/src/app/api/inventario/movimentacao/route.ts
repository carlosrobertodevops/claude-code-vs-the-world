import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { stockMovementSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);

    const body = await req.json();
    const validation = stockMovementSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("VALIDATION", "Dados inválidos", 400, validation.error.flatten());
    }

    const { productId, type, quantity, unitCost, notes } = validation.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return errorResponse("NOT_FOUND", "Produto não encontrado", 404);

    let newStock = product.currentStock;
    if (type === "IN") newStock += quantity;
    else if (type === "OUT") newStock -= quantity;
    else newStock = quantity; // ADJUSTMENT

    if (newStock < 0) {
      return errorResponse("INSUFFICIENT_STOCK", "Estoque insuficiente", 400);
    }

    const [movement] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          productId,
          userId: session.user.id,
          type,
          quantity,
          unitCost,
          notes,
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { currentStock: newStock },
      }),
    ]);

    return successResponse(movement);
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao registrar movimentação", 500, error);
  }
}
