import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createQuoteSchema, updateQuoteStatusSchema } from "@/lib/validations/quote";
import type { ApiResponse } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Nao autenticado" },
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true, cpfCnpj: true, address: true },
        },
        items: {
          include: {
            serviceType: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Orcamento nao encontrado" },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: quote });
  } catch (error) {
    console.error("GET /api/orcamentos/[id] error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor" },
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Nao autenticado" },
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.quote.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Orcamento nao encontrado" },
        },
        { status: 404 }
      );
    }

    // Check if it's a status-only update
    const statusParsed = updateQuoteStatusSchema.safeParse(body);
    if (statusParsed.success && Object.keys(body).length === 1 && body.status) {
      const quote = await prisma.quote.update({
        where: { id },
        data: { status: statusParsed.data.status },
        include: {
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
          items: {
            include: {
              serviceType: { select: { id: true, name: true } },
            },
          },
        },
      });

      return NextResponse.json({ success: true, data: quote });
    }

    // Full update with items
    const parsed = createQuoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<never>>(
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

    const { customerId, notes, validUntil, items } = parsed.data;

    const itemsWithSubtotals = items.map((item) => {
      const subtotal = item.unitPrice * item.quantity * (1 - item.discount / 100);
      return { ...item, subtotal };
    });

    const totalAmount = itemsWithSubtotals.reduce((sum, item) => sum + item.subtotal, 0);

    // Delete existing items and recreate
    await prisma.quoteItem.deleteMany({ where: { quoteId: id } });

    const quote = await prisma.quote.update({
      where: { id },
      data: {
        customerId,
        notes: notes || null,
        validUntil: validUntil ? new Date(validUntil) : null,
        totalAmount,
        items: {
          create: itemsWithSubtotals.map((item) => ({
            serviceTypeId: item.serviceTypeId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            subtotal: item.subtotal,
          })),
        },
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        items: {
          include: {
            serviceType: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: quote });
  } catch (error) {
    console.error("PUT /api/orcamentos/[id] error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor" },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Nao autenticado" },
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing = await prisma.quote.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Orcamento nao encontrado" },
        },
        { status: 404 }
      );
    }

    await prisma.quote.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("DELETE /api/orcamentos/[id] error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor" },
      },
      { status: 500 }
    );
  }
}
