import { prisma } from "@/lib/prisma";
import { success, requireRole, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    await requireRole("MANAGER");

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      completedOrders,
      totalRevenue,
      totalCustomers,
      activeOrders,
      lowStockProducts,
      revenueByDay,
    ] = await Promise.all([
      prisma.serviceOrder.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.serviceOrder.count({
        where: { status: "COMPLETED", createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.serviceOrder.aggregate({
        _sum: { totalAmount: true },
        where: { status: "COMPLETED", createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.customer.count(),
      prisma.serviceOrder.count({ where: { status: { in: ["WAITING", "IN_PROGRESS"] } } }),
      prisma.product.count({
        where: { isActive: true, currentStock: { lte: prisma.product.fields.minimumStock } },
      }),
      prisma.serviceOrder.groupBy({
        by: ["createdAt"],
        _sum: { totalAmount: true },
        _count: true,
        where: { status: "COMPLETED", createdAt: { gte: thirtyDaysAgo } },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return success({
      totalOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalCustomers,
      activeOrders,
      lowStockProducts,
      revenueByDay: revenueByDay.map((d) => ({
        date: d.createdAt.toISOString().split("T")[0],
        revenue: d._sum.totalAmount || 0,
        count: d._count,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
