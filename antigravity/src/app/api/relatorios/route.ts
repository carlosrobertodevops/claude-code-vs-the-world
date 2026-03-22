import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);
    if (session.user.role !== "MANAGER") return errorResponse("FORBIDDEN", "Acesso negado", 403);

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month";

    const now = new Date();
    let startDate: Date;
    if (period === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const [
      revenueByDay,
      servicesByType,
      ordersByStatus,
      topCustomers,
      inventoryAlerts,
      totalRevenue,
      totalOrders,
      avgTicket,
    ] = await Promise.all([
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, SUM(total_amount) as total, COUNT(*)::int as count
        FROM service_orders
        WHERE created_at >= ${startDate} AND status = 'COMPLETED'
        GROUP BY DATE(created_at)
        ORDER BY date
      ` as Promise<Array<{ date: Date; total: number; count: number }>>,
      prisma.$queryRaw`
        SELECT st.name, COUNT(*)::int as count, SUM(soi.subtotal) as revenue
        FROM service_order_items soi
        JOIN service_types st ON soi.service_type_id = st.id
        JOIN service_orders so ON soi.service_order_id = so.id
        WHERE so.created_at >= ${startDate} AND so.status = 'COMPLETED'
        GROUP BY st.name
        ORDER BY revenue DESC
      ` as Promise<Array<{ name: string; count: number; revenue: number }>>,
      prisma.serviceOrder.groupBy({
        by: ["status"],
        where: { createdAt: { gte: startDate } },
        _count: true,
      }),
      prisma.customer.findMany({
        take: 10,
        orderBy: { serviceOrders: { _count: "desc" } },
        select: {
          name: true,
          phone: true,
          _count: { select: { serviceOrders: true } },
        },
      }),
      prisma.$queryRaw`
        SELECT name, current_stock as "currentStock", minimum_stock as "minimumStock"
        FROM products
        WHERE is_active = true AND current_stock <= minimum_stock
      ` as Promise<Array<{ name: string; currentStock: number; minimumStock: number }>>,
      prisma.serviceOrder.aggregate({
        where: { createdAt: { gte: startDate }, status: "COMPLETED" },
        _sum: { totalAmount: true },
      }),
      prisma.serviceOrder.count({
        where: { createdAt: { gte: startDate }, status: { not: "CANCELLED" } },
      }),
      prisma.serviceOrder.aggregate({
        where: { createdAt: { gte: startDate }, status: "COMPLETED" },
        _avg: { totalAmount: true },
      }),
    ]);

    return successResponse({
      revenueByDay: (revenueByDay as Array<{ date: Date; total: number; count: number }>).map(d => ({
        date: String(d.date).split('T')[0],
        total: Number(d.total),
        count: Number(d.count),
      })),
      servicesByType: (servicesByType as Array<{ name: string; count: number; revenue: number }>).map(s => ({
        name: s.name,
        count: Number(s.count),
        revenue: Number(s.revenue),
      })),
      ordersByStatus: ordersByStatus.map(o => ({
        status: o.status,
        count: o._count,
      })),
      topCustomers,
      inventoryAlerts,
      summary: {
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalOrders,
        avgTicket: avgTicket._avg.totalAmount || 0,
      },
    });
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao buscar relatórios", 500, error);
  }
}
