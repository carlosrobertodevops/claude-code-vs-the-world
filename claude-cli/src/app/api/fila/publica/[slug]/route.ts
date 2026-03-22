import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STATUS_LABELS } from "@/lib/constants";

function maskPlate(plate: string): string {
  // Format: ABC-1D34 or ABC-1234 -> ABC-**34
  if (plate.length < 4) return "***";
  const prefix = plate.slice(0, 3);
  const suffix = plate.slice(-2);
  return `${prefix}-**${suffix}`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const config = await prisma.carWashConfig.findUnique({
      where: { slug },
    });

    if (!config) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Estabelecimento nao encontrado" } },
        { status: 404 }
      );
    }

    const entries = await prisma.queueEntry.findMany({
      orderBy: { position: "asc" },
      include: {
        serviceOrder: {
          include: {
            vehicle: { select: { plate: true } },
            items: {
              include: {
                serviceType: { select: { estimatedMinutes: true } },
              },
            },
          },
        },
      },
    });

    // Filter to only non-completed / non-cancelled orders
    const activeEntries = entries.filter(
      (e) =>
        e.serviceOrder.status === "WAITING" ||
        e.serviceOrder.status === "IN_PROGRESS"
    );

    const simultaneousSlots = config.simultaneousSlots || 1;

    const publicEntries = activeEntries.map((entry, index) => {
      // Calculate total estimated minutes for items ahead
      const itemsAhead = activeEntries.slice(0, index);
      const totalMinutesAhead = itemsAhead.reduce((sum, aheadEntry) => {
        const entryMinutes = aheadEntry.serviceOrder.items.reduce(
          (s, item) => s + (item.serviceType?.estimatedMinutes ?? 0) * item.quantity,
          0
        );
        return sum + entryMinutes;
      }, 0);

      const estimatedWaitMinutes = Math.ceil(totalMinutesAhead / simultaneousSlots);

      return {
        position: entry.position,
        maskedPlate: maskPlate(entry.serviceOrder.vehicle.plate),
        status: STATUS_LABELS[entry.serviceOrder.status] || entry.serviceOrder.status,
        estimatedWaitMinutes,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        businessName: config.businessName,
        entries: publicEntries,
      },
    });
  } catch (error) {
    console.error("GET /api/fila/publica/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao buscar fila publica" } },
      { status: 500 }
    );
  }
}
