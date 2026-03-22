import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: { code: "FORBIDDEN", message: "Acesso negado" } },
        { status: 403 }
      );
    }

    let config = await prisma.carWashConfig.findFirst();

    if (!config) {
      config = await prisma.carWashConfig.create({
        data: {
          businessName: "Meu Lava-Jato",
          slug: "meu-lava-jato",
          simultaneousSlots: 2,
        },
      });
    }

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("GET /api/configuracoes error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao buscar configuracoes" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: { code: "FORBIDDEN", message: "Acesso negado" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { businessName, slug, simultaneousSlots, phone, address } = body;

    if (!businessName || !slug) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Nome do estabelecimento e slug sao obrigatorios" },
        },
        { status: 400 }
      );
    }

    // Sanitize slug
    const sanitizedSlug = String(slug)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    let config = await prisma.carWashConfig.findFirst();

    if (config) {
      // Check slug uniqueness (excluding current)
      const existingSlug = await prisma.carWashConfig.findFirst({
        where: { slug: sanitizedSlug, NOT: { id: config.id } },
      });

      if (existingSlug) {
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: { code: "CONFLICT", message: "Slug ja esta em uso" } },
          { status: 409 }
        );
      }

      config = await prisma.carWashConfig.update({
        where: { id: config.id },
        data: {
          businessName,
          slug: sanitizedSlug,
          simultaneousSlots: Number(simultaneousSlots) || 2,
          phone: phone || null,
          address: address || null,
        },
      });
    } else {
      config = await prisma.carWashConfig.create({
        data: {
          businessName,
          slug: sanitizedSlug,
          simultaneousSlots: Number(simultaneousSlots) || 2,
          phone: phone || null,
          address: address || null,
        },
      });
    }

    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error("PUT /api/configuracoes error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao atualizar configuracoes" } },
      { status: 500 }
    );
  }
}
