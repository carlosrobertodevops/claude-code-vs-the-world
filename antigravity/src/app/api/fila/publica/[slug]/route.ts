import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, maskPlate } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const config = await prisma.carWashConfig.findUnique({ where: { slug } });
    if (!config) return errorResponse("NOT_FOUND", "Lava-jato não encontrado", 404);

    const entries = await prisma.queueEntry.findMany({
      orderBy: { position: "asc" },
      include: {
        serviceOrder: {
          include: {
            vehicle: { select: { plate: true, brand: true, model: true, color: true } },
            items: { include: { serviceType: { select: { estimatedMinutes: true } } } },
          },
        },
      },
    });

    const simultaneousSlots = config.simultaneousSlots;
    let accumulatedMinutes = 0;

    const publicQueue = entries.map((entry, index) => {
      const totalMinutes = entry.serviceOrder.items.reduce(
        (sum, item) => sum + (item.serviceType?.estimatedMinutes || 30),
        0
      );

      const estimatedWait = Math.max(0, Math.ceil(accumulatedMinutes / simultaneousSlots));

      if (index >= simultaneousSlots) {
        accumulatedMinutes += totalMinutes;
      }

      return {
        position: entry.position,
        plate: maskPlate(entry.serviceOrder.vehicle.plate),
        vehicleDescription: `${entry.serviceOrder.vehicle.brand} ${entry.serviceOrder.vehicle.model}`,
        color: entry.serviceOrder.vehicle.color,
        status: entry.serviceOrder.status,
        estimatedWaitMinutes: estimatedWait,
      };
    });

    return successResponse({
      businessName: config.businessName,
      phone: config.phone,
      queue: publicQueue,
    });
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao buscar fila pública", 500, error);
  }
}
