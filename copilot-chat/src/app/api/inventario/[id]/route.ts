import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error, requireAuth, handleApiError } from "@/lib/api";
import { productSchema } from "@/lib/validations/inventory";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { stockMovements: { orderBy: { createdAt: "desc" }, take: 20, include: { user: { select: { name: true } } } } },
    });
    if (!product) return error("Produto nao encontrado", 404);
    return success(product);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const data = productSchema.parse(body);
    const product = await prisma.product.update({ where: { id }, data });
    return success(product);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return success({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
