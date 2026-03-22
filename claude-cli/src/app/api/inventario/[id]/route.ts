import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateProductSchema } from "@/lib/validations/product";
import { auth } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Nao autenticado" } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { stockMovements: { orderBy: { createdAt: "desc" }, take: 10 } },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Produto nao encontrado" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao buscar produto" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Nao autenticado" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Dados invalidos",
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Produto nao encontrado" } },
        { status: 404 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao atualizar produto" } },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Nao autenticado" } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Produto nao encontrado" } },
        { status: 404 }
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao excluir produto" } },
      { status: 500 }
    );
  }
}
