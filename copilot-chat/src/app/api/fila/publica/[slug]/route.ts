import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const config = await prisma.carWashConfig.findUnique({ where: { slug } });
    if (!config) return error("Lava-jato nao encontrado", 404);

    const entries = await prisma.queueEntry.findMany({
      include: {
        serviceOrder: {
          select: {
            status: true,
            vehicle: { select: { plate: true } },
            items: { include: { serviceType: { select: { estimatedMinutes: true } } } },
          },
        },
      },
      orderBy: { position: "asc" },
    });

    const slots = config.simultaneousSlots;
    const queue = entries.map((entry, index) => {
      const plate = entry.serviceOrder.vehicle.plate;
      const masked = plate.substring(0, 3) + "-**" + plate.substring(5);

      const totalMinutes = entry.serviceOrder.items.reduce(
        (sum, item) => sum + (item.serviceType?.estimatedMinutes || 30),
        0
      );

      const aheadMinutes = entries
        .slice(0, index)
        .reduce((sum, e) => {
          return (
            sum +
            e.serviceOrder.items.reduce(
              (s, i) => s + (i.serviceType?.estimatedMinutes || 30),
              0
            )
          );
        }, 0);

      const estimatedWait = Math.ceil(aheadMinutes / slots);

      return {
        position: entry.position,
        plate: masked,
        status: entry.serviceOrder.status,
        estimatedMinutes: totalMinutes,
        estimatedWait,
      };
    });

    return success({
      businessName: config.businessName,
      phone: config.phone,
      queue,
    });
  } catch (err) {
    console.error(err);
    return error("Erro interno", 500);
  }
}
