import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createContractSchema } from "@/lib/validations/contract";
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
        { contractNumber: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contract.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: contracts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/contratos error:", error);
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
    const parsed = createContractSchema.safeParse(body);

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

    const { customerId, title, content } = parsed.data;

    // Generate contract number
    const lastContract = await prisma.contract.findFirst({
      orderBy: { contractNumber: "desc" },
      select: { contractNumber: true },
    });

    let nextNumber = 1;
    if (lastContract) {
      const match = lastContract.contractNumber.match(/CTR-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const contractNumber = `CTR-${String(nextNumber).padStart(4, "0")}`;

    const contract = await prisma.contract.create({
      data: {
        customerId,
        contractNumber,
        title,
        content,
        status: "PENDING_SIGNATURE",
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: contract }, { status: 201 });
  } catch (error) {
    console.error("POST /api/contratos error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor" },
      },
      { status: 500 }
    );
  }
}
