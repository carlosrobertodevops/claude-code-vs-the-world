import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCustomerSchema } from "@/lib/validations/customer";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: { select: { vehicles: true } },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: customers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error listing customers:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao listar clientes" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createCustomerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Dados inválidos",
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        cpfCnpj: data.cpfCnpj || null,
        address: data.address || null,
      },
    });

    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao criar cliente" } },
      { status: 500 }
    );
  }
}
