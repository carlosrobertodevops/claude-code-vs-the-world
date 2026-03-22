import { ServiceOrderStatus } from "@prisma/client";
import { addMinutes } from "date-fns";

import { prisma } from "@/lib/prisma";
import { maskPlate } from "@/lib/utils";

function estimateMinutes(items: Array<{ serviceType?: { estimatedMinutes: number } | null }>) {
  const total = items.reduce((sum, item) => sum + (item.serviceType?.estimatedMinutes ?? 0), 0);
  return total || 30;
}

export async function recalculateQueue() {
  const config = await prisma.carWashConfig.findFirst();
  const simultaneousSlots = config?.simultaneousSlots ?? 1;

  const waitingOrders = await prisma.serviceOrder.findMany({
    where: { status: ServiceOrderStatus.WAITING },
    include: {
      items: {
        include: {
          serviceType: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  await prisma.queueEntry.deleteMany();

  const now = new Date();
  const entries = waitingOrders.map((order, index) => {
    const estimatedMinutes = estimateMinutes(order.items);
    const laneOffset = Math.floor(index / simultaneousSlots);
    const estimatedStart = addMinutes(now, laneOffset * estimatedMinutes);
    const estimatedEnd = addMinutes(estimatedStart, estimatedMinutes);

    return {
      serviceOrderId: order.id,
      position: index + 1,
      estimatedStart,
      estimatedEnd,
    };
  });

  if (entries.length > 0) {
    await prisma.queueEntry.createMany({ data: entries });
  }

  return entries;
}

export async function getPublicQueue(slug: string) {
  const config = await prisma.carWashConfig.findUnique({ where: { slug } });
  if (!config) {
    return null;
  }

  await recalculateQueue();

  const entries = await prisma.queueEntry.findMany({
    include: {
      serviceOrder: {
        include: {
          vehicle: true,
        },
      },
    },
    orderBy: { position: "asc" },
  });

  return {
    config,
    entries: entries.map((entry) => ({
      id: entry.id,
      position: entry.position,
      estimatedStart: entry.estimatedStart,
      estimatedEnd: entry.estimatedEnd,
      status: entry.serviceOrder.status,
      plate: maskPlate(entry.serviceOrder.vehicle.plate),
      orderNumber: entry.serviceOrder.orderNumber,
    })),
  };
}
