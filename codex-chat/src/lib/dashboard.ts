import { ServiceOrderStatus } from "@prisma/client";
import { subDays } from "date-fns";

import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const [customers, products, waitingOrders, completedOrders, revenueOrders, lowStock, recentOrders, queueSize] = await Promise.all([
    prisma.customer.count(),
    prisma.product.count(),
    prisma.serviceOrder.count({ where: { status: ServiceOrderStatus.WAITING } }),
    prisma.serviceOrder.count({ where: { status: ServiceOrderStatus.COMPLETED } }),
    prisma.serviceOrder.findMany({
      where: {
        status: ServiceOrderStatus.COMPLETED,
        completedAt: { gte: subDays(new Date(), 30) },
      },
      select: { totalAmount: true },
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: { currentStock: "asc" },
      take: 5,
    }),
    prisma.serviceOrder.findMany({
      include: {
        customer: true,
        vehicle: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.queueEntry.count(),
  ]);

  const monthlyRevenue = revenueOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

  return {
    customers,
    products,
    waitingOrders,
    completedOrders,
    monthlyRevenue,
    lowStock,
    recentOrders,
    queueSize,
  };
}
