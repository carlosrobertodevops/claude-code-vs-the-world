import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateCustomerSchema } from "@/lib/validations/customer";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        vehicles: { orderBy: { createdAt: "desc" } },
        _count: { select: { vehicles: true, serviceOrders: true } },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Cliente não encontrado" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao buscar cliente" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateCustomerSchema.safeParse(body);

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

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Cliente não encontrado" } },
        { status: 404 }
      );
    }

    const data = parsed.data;
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.cpfCnpj !== undefined && { cpfCnpj: data.cpfCnpj || null }),
        ...(data.address !== undefined && { address: data.address || null }),
      },
    });

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao atualizar cliente" } },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Cliente não encontrado" } },
        { status: 404 }
      );
    }

    await prisma.customer.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao excluir cliente" } },
      { status: 500 }
    );
  }
}
