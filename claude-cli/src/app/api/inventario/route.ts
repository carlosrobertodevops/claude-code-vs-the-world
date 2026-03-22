import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProductSchema } from "@/lib/validations/product";
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
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");

    const where: Record<string, unknown> = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    if (isActive !== null && isActive !== "") {
      where.isActive = isActive === "true";
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("Error listing products:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao listar produtos" } },
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
    const parsed = createProductSchema.safeParse(body);

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

    const product = await prisma.product.create({
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao criar produto" } },
      { status: 500 }
    );
  }
}
