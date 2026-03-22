import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error, requireAuth, handleApiError } from "@/lib/api";
import { customerSchema } from "@/lib/validations/customer";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { vehicles: true, serviceOrders: { orderBy: { createdAt: "desc" }, take: 10 } },
    });
    if (!customer) return error("Cliente nao encontrado", 404);
    return success(customer);
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
    const data = customerSchema.parse(body);
    const customer = await prisma.customer.update({ where: { id }, data });
    return success(customer);
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
    await prisma.customer.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
