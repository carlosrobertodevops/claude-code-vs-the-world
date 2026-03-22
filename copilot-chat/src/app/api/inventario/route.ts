import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error, requireAuth, handleApiError } from "@/lib/api";
import { productSchema } from "@/lib/validations/inventory";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const showInactive = searchParams.get("showInactive") === "true";

    const where = {
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
      ...(!showInactive ? { isActive: true } : {}),
    };

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return success(products);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const body = await req.json();
    const data = productSchema.parse(body);

    const product = await prisma.product.create({ data });
    return success(product);
  } catch (err) {
    return handleApiError(err);
  }
}
