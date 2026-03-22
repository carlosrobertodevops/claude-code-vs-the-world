import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, requireAuth, handleApiError } from "@/lib/api";
import { customerSchema } from "@/lib/validations/customer";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
              { cpfCnpj: { contains: search } },
            ],
          }
        : {},
      include: { vehicles: true, _count: { select: { serviceOrders: true } } },
      orderBy: { name: "asc" },
    });

    return success(customers);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const body = await req.json();
    const data = customerSchema.parse(body);
    const customer = await prisma.customer.create({ data });
    return success(customer);
  } catch (err) {
    return handleApiError(err);
  }
}
