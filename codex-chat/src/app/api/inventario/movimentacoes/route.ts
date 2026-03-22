import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stockMovementSchema } from "@/lib/validations/product";
import { apiError, apiSuccess } from "@/lib/utils";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);

  const body = await request.json();
  const parsed = stockMovementSchema.safeParse({ ...body, userId: body.userId ?? session.user.id });
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Dados invalidos.", parsed.error.flatten(), 422);

  const movement = await prisma.stockMovement.create({ data: parsed.data });
  const delta = parsed.data.type === "OUT" ? -parsed.data.quantity : parsed.data.quantity;
  await prisma.product.update({
    where: { id: parsed.data.productId },
    data: { currentStock: { increment: delta } },
  });

  return apiSuccess(movement);
}
