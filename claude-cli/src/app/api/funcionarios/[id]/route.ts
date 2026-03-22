import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { updateUserSchema } from "@/lib/validations/user";
import type { ApiResponse } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Acesso negado" },
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Funcionario nao encontrado" },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("GET /api/funcionarios/[id] error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor" },
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Acesso negado" },
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

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

    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Funcionario nao encontrado" },
        },
        { status: 404 }
      );
    }

    const { password, ...rest } = parsed.data;

    const updateData: Record<string, unknown> = { ...rest };

    if (password) {
      updateData.passwordHash = await hash(password, 12);
    }

    // Check email uniqueness if email is being changed
    if (rest.email && rest.email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: rest.email },
      });

      if (emailTaken) {
        return NextResponse.json<ApiResponse<never>>(
          {
            success: false,
            error: { code: "CONFLICT", message: "Email ja cadastrado" },
          },
          { status: 409 }
        );
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("PUT /api/funcionarios/[id] error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor" },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Acesso negado" },
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Funcionario nao encontrado" },
        },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("DELETE /api/funcionarios/[id] error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor" },
      },
      { status: 500 }
    );
  }
}
