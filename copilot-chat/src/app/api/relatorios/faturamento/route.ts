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
      where: { status: "COMPLETED", completedAt: { gte: startDate } },
      include: {
        items: { include: { serviceType: true } },
        employee: { select: { name: true } },
      },
      orderBy: { completedAt: "asc" },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Revenue by day
    const revenueMap = new Map<string, number>();
    orders.forEach((o) => {
      const day = (o.completedAt || o.createdAt).toISOString().split("T")[0];
      revenueMap.set(day, (revenueMap.get(day) || 0) + o.totalAmount);
    });
    const revenueByDay = Array.from(revenueMap.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    // Revenue by employee
    const empMap = new Map<string, number>();
    orders.forEach((o) => {
      const name = o.employee?.name || "Nao atribuido";
      empMap.set(name, (empMap.get(name) || 0) + o.totalAmount);
    });
    const revenueByEmployee = Array.from(empMap.entries()).map(([name, revenue]) => ({
      name,
      revenue,
    }));

    return success({
      totalRevenue,
      totalOrders: orders.length,
      avgTicket,
      revenueByDay,
      revenueByEmployee,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
