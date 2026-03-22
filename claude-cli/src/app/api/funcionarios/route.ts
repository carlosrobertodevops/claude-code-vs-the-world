import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createUserSchema } from "@/lib/validations/user";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
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

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "10")));
    const search = searchParams.get("search") || "";

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/funcionarios error:", error);
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

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Acesso negado" },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

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

    const { name, email, password, role, phone } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "CONFLICT", message: "Email ja cadastrado" },
        },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        phone: phone || null,
      },
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

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("POST /api/funcionarios error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor" },
      },
      { status: 500 }
    );
  }
}
