import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateServiceTypeSchema } from "@/lib/validations/service";
import { auth } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Nao autenticado" } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const serviceType = await prisma.serviceType.findUnique({
      where: { id },
    });

    if (!serviceType) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Tipo de servico nao encontrado" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: serviceType });
  } catch (error) {
    console.error("Error fetching service type:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao buscar tipo de servico" } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Nao autenticado" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateServiceTypeSchema.safeParse(body);

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

    const existing = await prisma.serviceType.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Tipo de servico nao encontrado" } },
        { status: 404 }
      );
    }

    const serviceType = await prisma.serviceType.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: serviceType });
  } catch (error) {
    console.error("Error updating service type:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao atualizar tipo de servico" } },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Nao autenticado" } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing = await prisma.serviceType.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Tipo de servico nao encontrado" } },
        { status: 404 }
      );
    }

    await prisma.serviceType.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("Error deleting service type:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao excluir tipo de servico" } },
      { status: 500 }
    );
  }
}
