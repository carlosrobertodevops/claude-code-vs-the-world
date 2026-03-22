import { ServiceOrderStatus } from "@prisma/client";
import { eachDayOfInterval, format, subDays } from "date-fns";

import { prisma } from "@/lib/prisma";

export async function getReportData() {
  const rangeStart = subDays(new Date(), 6);
  const [orders, customers, products, serviceBreakdown] = await Promise.all([
    prisma.serviceOrder.findMany({
      where: {
        createdAt: { gte: rangeStart },
        status: { in: [ServiceOrderStatus.COMPLETED, ServiceOrderStatus.IN_PROGRESS, ServiceOrderStatus.WAITING] },
      },
      include: {
        items: {
          include: { serviceType: true },
        },
      },
    }),
    prisma.customer.findMany({
      orderBy: { loyaltyPoints: "desc" },
      take: 5,
    }),
    prisma.product.findMany({ orderBy: { currentStock: "asc" }, take: 5 }),
    prisma.serviceType.findMany({
      include: {
        serviceOrderItems: true,
      },
    }),
  ]);

  const revenueByDay = eachDayOfInterval({ start: rangeStart, end: new Date() }).map((date) => {
    const total = orders
      .filter((order) => order.status === ServiceOrderStatus.COMPLETED && format(order.createdAt, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))
      .reduce((sum, order) => sum + Number(order.totalAmount), 0);

    return {
      day: format(date, "dd/MM"),
      revenue: total,
    };
  });

  const serviceMix = serviceBreakdown.map((service) => ({
    name: service.name,
    total: service.serviceOrderItems.length,
  }));

  return {
    revenueByDay,
    topCustomers: customers,
    lowStock: products,
    serviceMix,
  };
}

export function toCsv(rows: Array<Record<string, string | number>>) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(","));
  return [headers.join(","), ...lines].join("\n");
}
