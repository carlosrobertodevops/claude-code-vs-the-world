import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createQuoteSchema } from "@/lib/validations/quote";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
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

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "10")));
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { quoteNumber: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.quote.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: quotes,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/orcamentos error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor" },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
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

    // Generate quote number
    const lastQuote = await prisma.quote.findFirst({
      orderBy: { quoteNumber: "desc" },
      select: { quoteNumber: true },
    });

    let nextNumber = 1;
    if (lastQuote) {
      const match = lastQuote.quoteNumber.match(/ORC-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const quoteNumber = `ORC-${String(nextNumber).padStart(4, "0")}`;

    // Calculate item subtotals and total
    const itemsWithSubtotals = items.map((item) => {
      const subtotal = item.unitPrice * item.quantity * (1 - item.discount / 100);
      return { ...item, subtotal };
    });

    const totalAmount = itemsWithSubtotals.reduce((sum, item) => sum + item.subtotal, 0);

    const quote = await prisma.quote.create({
      data: {
        customerId,
        quoteNumber,
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

    return NextResponse.json({ success: true, data: quote }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orcamentos error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor" },
      },
      { status: 500 }
    );
  }
}
