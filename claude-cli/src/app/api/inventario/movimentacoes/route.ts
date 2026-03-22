import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createStockMovementSchema } from "@/lib/validations/product";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Nao autenticado" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "productId obrigatorio" } },
        { status: 400 }
      );
    }

    const movements = await prisma.stockMovement.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: movements });
  } catch (error) {
    console.error("Error listing stock movements:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao listar movimentacoes" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Nao autenticado" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = createStockMovementSchema.safeParse(body);

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

    const { productId, type, quantity, unitCost, notes } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Produto nao encontrado" } },
        { status: 404 }
      );
    }

    // Check sufficient stock for OUT movements
    if (type === "OUT" && product.currentStock < quantity) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INSUFFICIENT_STOCK",
            message: `Estoque insuficiente. Disponivel: ${product.currentStock}`,
          },
        },
        { status: 400 }
      );
    }

    // Calculate new stock
    let newStock: number;
    switch (type) {
      case "IN":
        newStock = product.currentStock + quantity;
        break;
      case "OUT":
        newStock = product.currentStock - quantity;
        break;
      case "ADJUSTMENT":
        newStock = quantity;
        break;
    }

    // Use transaction to ensure consistency
    const [movement] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          productId,
          userId: session.user.id,
          type,
          quantity,
          unitCost: unitCost ?? null,
          notes: notes || null,
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { currentStock: newStock },
      }),
    ]);

    return NextResponse.json({ success: true, data: movement }, { status: 201 });
  } catch (error) {
    console.error("Error creating stock movement:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao criar movimentacao" } },
      { status: 500 }
    );
  }
}
