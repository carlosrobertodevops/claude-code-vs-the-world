import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createVehicleSchema } from "@/lib/validations/customer";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Cliente não encontrado" } },
        { status: 404 }
      );
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { customerId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: vehicles });
  } catch (error) {
    console.error("Error listing vehicles:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao listar veículos" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const parsed = createVehicleSchema.safeParse({ ...body, customerId: id });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Dados inválidos",
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Cliente não encontrado" } },
        { status: 404 }
      );
    }

    const data = parsed.data;

    const existingPlate = await prisma.vehicle.findUnique({ where: { plate: data.plate } });
    if (existingPlate) {
      return NextResponse.json(
        { success: false, error: { code: "DUPLICATE_PLATE", message: "Placa já cadastrada" } },
        { status: 409 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        customerId: id,
        plate: data.plate.toUpperCase(),
        brand: data.brand,
        model: data.model,
        year: data.year || null,
        color: data.color || null,
      },
    });

    return NextResponse.json({ success: true, data: vehicle }, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao criar veículo" } },
      { status: 500 }
    );
  }
}
