import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServiceTypeSchema } from "@/lib/validations/service";
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
    const isActive = searchParams.get("isActive");

    const where: Record<string, unknown> = {};
    if (isActive !== null && isActive !== "") {
      where.isActive = isActive === "true";
    }

    const serviceTypes = await prisma.serviceType.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: serviceTypes });
  } catch (error) {
    console.error("Error listing service types:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao listar tipos de servico" } },
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
    const parsed = createServiceTypeSchema.safeParse(body);

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

    const serviceType = await prisma.serviceType.create({
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: serviceType }, { status: 201 });
  } catch (error) {
    console.error("Error creating service type:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao criar tipo de servico" } },
      { status: 500 }
    );
  }
}
