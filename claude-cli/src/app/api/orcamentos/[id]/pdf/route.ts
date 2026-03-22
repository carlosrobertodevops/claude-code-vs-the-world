import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuotePdfDocument } from "./pdf-document";
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

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true, cpfCnpj: true, address: true },
        },
        items: {
          include: {
            serviceType: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Orcamento nao encontrado" },
        },
        { status: 404 }
      );
    }

    const buffer = await renderToBuffer(QuotePdfDocument({ quote }));
    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${quote.quoteNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("GET /api/orcamentos/[id]/pdf error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Erro ao gerar PDF" },
      },
      { status: 500 }
    );
  }
}
