import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateContractSchema } from "@/lib/validations/contract";
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

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true, cpfCnpj: true, address: true },
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
    console.error("GET /api/contratos/[id] error:", error);
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

    const existing = await prisma.contract.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Contrato nao encontrado" },
        },
        { status: 404 }
      );
    }

    if (existing.status === "SIGNED") {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "CONFLICT", message: "Contrato ja assinado nao pode ser editado" },
        },
        { status: 409 }
      );
    }

    const parsed = updateContractSchema.safeParse(body);

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

    const contract = await prisma.contract.update({
      where: { id },
      data: parsed.data,
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: contract });
  } catch (error) {
    console.error("PUT /api/contratos/[id] error:", error);
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

    const existing = await prisma.contract.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Contrato nao encontrado" },
        },
        { status: 404 }
      );
    }

    if (existing.status === "SIGNED") {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "CONFLICT", message: "Contrato assinado nao pode ser excluido" },
        },
        { status: 409 }
      );
    }

    await prisma.contract.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("DELETE /api/contratos/[id] error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor" },
      },
      { status: 500 }
    );
  }
}
