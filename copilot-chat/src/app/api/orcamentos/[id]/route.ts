import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error, requireAuth, handleApiError } from "@/lib/api";
import { quoteStatusSchema } from "@/lib/validations/quote";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { serviceType: true } },
      },
    });
    if (!quote) return error("Orcamento nao encontrado", 404);
    return success(quote);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const { status } = quoteStatusSchema.parse(body);
    const quote = await prisma.quote.update({ where: { id }, data: { status } });
    return success(quote);
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
    await prisma.quote.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
