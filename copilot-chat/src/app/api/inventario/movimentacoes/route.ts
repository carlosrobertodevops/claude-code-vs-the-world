import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, requireAuth, handleApiError } from "@/lib/api";
import { stockMovementSchema } from "@/lib/validations/inventory";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const data = stockMovementSchema.parse(body);

    const movement = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: data.productId } });
      if (!product) throw new Error("Produto nao encontrado");

      let newStock = product.currentStock;
      if (data.type === "IN") newStock += data.quantity;
      else if (data.type === "OUT") newStock -= data.quantity;
      else newStock = data.quantity;

      await tx.product.update({
        where: { id: data.productId },
        data: { currentStock: newStock },
      });

      return tx.stockMovement.create({
        data: {
          productId: data.productId,
          userId: session.user.id,
          type: data.type,
          quantity: data.quantity,
          unitCost: data.unitCost,
          notes: data.notes,
        },
      });
    });

    return success(movement);
  } catch (err) {
    return handleApiError(err);
  }
}
