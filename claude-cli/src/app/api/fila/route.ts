import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: { code: "UNAUTHORIZED", message: "Nao autenticado" } },
        { status: 401 }
      );
    }

    const entries = await prisma.queueEntry.findMany({
      orderBy: { position: "asc" },
      include: {
        serviceOrder: {
          include: {
            customer: { select: { id: true, name: true } },
            vehicle: { select: { id: true, plate: true, brand: true, model: true } },
            items: {
              include: {
                serviceType: { select: { name: true, estimatedMinutes: true } },
                product: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error("GET /api/fila error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao listar fila" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: { code: "UNAUTHORIZED", message: "Nao autenticado" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const items = body as Array<{ id: string; position: number }>;

    if (!Array.isArray(items) || items.some((i) => !i.id || typeof i.position !== "number")) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Formato invalido. Envie um array de {id, position}." },
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.queueEntry.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );

    const entries = await prisma.queueEntry.findMany({
      orderBy: { position: "asc" },
      include: {
        serviceOrder: {
          include: {
            customer: { select: { id: true, name: true } },
            vehicle: { select: { id: true, plate: true, brand: true, model: true } },
            items: {
              include: {
                serviceType: { select: { name: true, estimatedMinutes: true } },
                product: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error("PUT /api/fila error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao reordenar fila" } },
      { status: 500 }
    );
  }
}
