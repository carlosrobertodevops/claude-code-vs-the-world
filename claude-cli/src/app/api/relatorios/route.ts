import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: { code: "FORBIDDEN", message: "Acesso negado" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "revenue";

    switch (type) {
      case "revenue":
        return await getRevenueReport();
      case "services":
        return await getServicesReport();
      case "inventory":
        return await getInventoryReport();
      case "customers":
        return await getCustomersReport();
      default:
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: { code: "VALIDATION_ERROR", message: "Tipo de relatorio invalido" } },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("GET /api/relatorios error:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro ao gerar relatorio" } },
      { status: 500 }
    );
  }
}

async function getRevenueReport() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const orders = await prisma.serviceOrder.findMany({
    where: {
      status: "COMPLETED",
      completedAt: { gte: thirtyDaysAgo },
    },
    select: {
      totalAmount: true,
      completedAt: true,
    },
    orderBy: { completedAt: "asc" },
  });

  // Group by day
  const dailyMap = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const key = date.toISOString().split("T")[0];
    dailyMap.set(key, 0);
  }

  for (const order of orders) {
    if (order.completedAt) {
      const key = order.completedAt.toISOString().split("T")[0];
      dailyMap.set(key, (dailyMap.get(key) || 0) + order.totalAmount);
    }
  }

  const dailyRevenue = Array.from(dailyMap.entries()).map(([date, total]) => ({
    date,
    total: Math.round(total * 100) / 100,
  }));

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return NextResponse.json({
    success: true,
    data: {
      dailyRevenue,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      orderCount: orders.length,
    },
  });
}

async function getServicesReport() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const items = await prisma.serviceOrderItem.findMany({
    where: {
      serviceTypeId: { not: null },
      serviceOrder: {
        status: "COMPLETED",
        completedAt: { gte: thirtyDaysAgo },
      },
    },
    include: {
      serviceType: { select: { name: true } },
    },
  });

  const serviceMap = new Map<string, { name: string; count: number; revenue: number }>();

  for (const item of items) {
    const name = item.serviceType?.name || "Outro";
    const existing = serviceMap.get(name) || { name, count: 0, revenue: 0 };
    existing.count += item.quantity;
    existing.revenue += item.subtotal;
    serviceMap.set(name, existing);
  }

  const topServices = Array.from(serviceMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map((s) => ({
      ...s,
      revenue: Math.round(s.revenue * 100) / 100,
    }));

  return NextResponse.json({ success: true, data: { topServices } });
}

async function getInventoryReport() {
  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const lowStockProducts = allProducts.filter(
    (p) => p.currentStock <= p.minimumStock
  );

  return NextResponse.json({
    success: true,
    data: {
      lowStockProducts: lowStockProducts.map((p) => ({
        id: p.id,
        name: p.name,
        unit: p.unit,
        currentStock: p.currentStock,
        minimumStock: p.minimumStock,
        costPrice: p.costPrice,
      })),
    },
  });
}

async function getCustomersReport() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const customers = await prisma.customer.findMany({
    include: {
      serviceOrders: {
        where: { status: "COMPLETED" },
        select: { totalAmount: true },
      },
    },
  });

  const topCustomers = customers
    .map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      orderCount: c.serviceOrders.length,
      totalSpent: Math.round(
        c.serviceOrders.reduce((sum, o) => sum + o.totalAmount, 0) * 100
      ) / 100,
    }))
    .filter((c) => c.orderCount > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 20);

  return NextResponse.json({ success: true, data: { topCustomers } });
}
