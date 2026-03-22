import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signContractSchema } from "@/lib/validations/contract";
import type { ApiResponse } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

// Public GET: returns contract data needed for signing (no auth required)
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const contract = await prisma.contract.findUnique({
      where: { id },
      select: {
        id: true,
        contractNumber: true,
        status: true,
        title: true,
        content: true,
        customer: {
          select: { name: true },
        },
      },
    });

    if (!contract) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Contrato nao encontrado" },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: contract });
  } catch (error) {
    console.error("GET /api/contratos/[id]/assinar error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor" },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const parsed = signContractSchema.safeParse(body);

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

    const contract = await prisma.contract.findUnique({ where: { id } });

    if (!contract) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Contrato nao encontrado" },
        },
        { status: 404 }
      );
    }

    if (contract.status === "SIGNED") {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "CONFLICT", message: "Contrato ja foi assinado" },
        },
        { status: 409 }
      );
    }

    if (contract.status === "CANCELLED") {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "CONFLICT", message: "Contrato foi cancelado" },
        },
        { status: 409 }
      );
    }

    // Get client IP from headers
    const forwarded = request.headers.get("x-forwarded-for");
    const signatureIp = forwarded
      ? forwarded.split(",")[0].trim()
      : request.headers.get("x-real-ip") || "unknown";

    const updated = await prisma.contract.update({
      where: { id },
      data: {
        signatureData: parsed.data.signatureData,
        signatureIp,
        signedAt: new Date(),
        status: "SIGNED",
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("POST /api/contratos/[id]/assinar error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor" },
      },
      { status: 500 }
    );
  }
}
