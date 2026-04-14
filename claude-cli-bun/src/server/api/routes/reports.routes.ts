import { Elysia } from "elysia";
import { extractUser, requireManager } from "../plugins/auth";
import { db } from "@/server/infrastructure/drizzle/client";
import { serviceOrders, products, serviceTypes } from "../../../../drizzle/schema";
import { and, count, eq, gte, isNull, sql, sum } from "drizzle-orm";
import { success } from "@/lib/utils/response";

export const reportRoutes = new Elysia({ prefix: "/relatorios" })
  .get("/receita", async ({ headers, query }) => {
    requireManager(await extractUser(headers));
    const since = query.from ? new Date(query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const rows = await db.select({
      day: sql<string>`date_trunc('day', ${serviceOrders.createdAt})::date::text`,
      total: sum(serviceOrders.total),
    }).from(serviceOrders)
      .where(and(isNull(serviceOrders.deletedAt), gte(serviceOrders.createdAt, since), eq(serviceOrders.status, "DELIVERED")))
      .groupBy(sql`date_trunc('day', ${serviceOrders.createdAt})`)
      .orderBy(sql`date_trunc('day', ${serviceOrders.createdAt})`);
    return success(rows);
  })
  .get("/servicos-resumo", async ({ headers }) => {
    requireManager(await extractUser(headers));
    const rows = await db.select({ id: serviceTypes.id, name: serviceTypes.name, count: count() })
      .from(serviceTypes).groupBy(serviceTypes.id, serviceTypes.name);
    return success(rows);
  })
  .get("/estoque", async ({ headers }) => {
    requireManager(await extractUser(headers));
    return success(await db.select().from(products).where(isNull(products.deletedAt)));
  })
  .get("/export-csv", async ({ headers, set }) => {
    requireManager(await extractUser(headers));
    const rows = await db.select({ id: serviceOrders.id, total: serviceOrders.total, status: serviceOrders.status, createdAt: serviceOrders.createdAt })
      .from(serviceOrders).where(isNull(serviceOrders.deletedAt));
    const csv = ["id,total,status,created_at", ...rows.map((r) => `${r.id},${r.total},${r.status},${r.createdAt.toISOString()}`)].join("\n");
    set.headers["content-type"] = "text/csv";
    set.headers["content-disposition"] = `attachment; filename="lavaflow-report.csv"`;
    return csv;
  });
