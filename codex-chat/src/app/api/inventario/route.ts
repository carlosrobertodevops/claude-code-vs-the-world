import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import { apiError, apiSuccess } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);

  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  return apiSuccess(products);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);

  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Dados invalidos.", parsed.error.flatten(), 422);

  const product = await prisma.product.create({ data: parsed.data });
  return apiSuccess(product);
}
