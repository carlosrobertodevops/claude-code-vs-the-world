import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, requireRole, handleApiError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    await requireRole("MANAGER");
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30";
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const orders = await prisma.serviceOrder.findMany({
      where: { createdAt: { gte: startDate } },
      include: {
        items: { include: { serviceType: true } },
      },
    });

    // Count by status
    const statusCount = {
      WAITING: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    orders.forEach((o) => {
      statusCount[o.status as keyof typeof statusCount]++;
    });

    // Top services
    const serviceCount = new Map<string, number>();
    orders.forEach((o) => {
      o.items.forEach((i) => {
        const name = i.serviceType?.name || i.description;
        serviceCount.set(name, (serviceCount.get(name) || 0) + 1);
      });
    });
    const topServices = Array.from(serviceCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return success({
      total: orders.length,
      statusCount,
      topServices,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
