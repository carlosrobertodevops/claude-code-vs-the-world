import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse, generateOrderNumber } from "@/lib/utils";
import { createQuoteSchema, updateQuoteStatusSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { quoteNumber: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          customer: true,
          items: { include: { serviceType: true } },
        },
      }),
      prisma.quote.count({ where }),
    ]);

    return successResponse(quotes, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao buscar orçamentos", 500, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);

    const body = await req.json();
    const validation = createQuoteSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("VALIDATION", "Dados inválidos", 400, validation.error.flatten());
    }

    const { items, ...quoteData } = validation.data;
    const count = await prisma.quote.count();
    const quoteNumber = generateOrderNumber("ORC", count + 1);

    const totalAmount = items.reduce((sum, item) => {
      const subtotal = item.unitPrice * item.quantity - item.discount;
      return sum + subtotal;
    }, 0);

    const quote = await prisma.quote.create({
      data: {
        ...quoteData,
        quoteNumber,
        totalAmount,
        validUntil: quoteData.validUntil ? new Date(quoteData.validUntil) : null,
        items: {
          create: items.map((item) => ({
            serviceTypeId: item.serviceTypeId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            subtotal: item.unitPrice * item.quantity - item.discount,
          })),
        },
      },
      include: { customer: true, items: { include: { serviceType: true } } },
    });

    return successResponse(quote);
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao criar orçamento", 500, error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);

    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return errorResponse("VALIDATION", "ID é obrigatório", 400);

    const validation = updateQuoteStatusSchema.safeParse(rest);
    if (!validation.success) {
      return errorResponse("VALIDATION", "Dados inválidos", 400, validation.error.flatten());
    }

    const quote = await prisma.quote.update({
      where: { id },
      data: { status: validation.data.status },
      include: { customer: true, items: { include: { serviceType: true } } },
    });

    return successResponse(quote);
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao atualizar orçamento", 500, error);
  }
}
