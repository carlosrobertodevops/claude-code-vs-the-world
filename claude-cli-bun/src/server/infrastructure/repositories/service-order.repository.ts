import { and, count, eq, isNull, gte, lte } from "drizzle-orm";
import { db } from "../drizzle/client";
import { serviceOrders, serviceOrderItems } from "../../../../drizzle/schema";
import type { IServiceOrderRepository, ListServiceOrdersFilters } from "@/server/domain/repositories/IServiceOrderRepository";
import type { CreateServiceOrderInput, ServiceOrder, UpdateServiceOrderStatusInput } from "@/lib/types/service-order.types";
import type { PaginatedResult } from "@/lib/types/common.types";
import { paginate, buildPaginationMeta } from "@/lib/utils/pagination";

const mapSO = (r: typeof serviceOrders.$inferSelect): ServiceOrder => ({
  id: r.id, customerId: r.customerId, vehicleId: r.vehicleId, employeeId: r.employeeId, status: r.status,
  notes: r.notes, total: r.total, startedAt: r.startedAt, finishedAt: r.finishedAt,
  createdAt: r.createdAt, updatedAt: r.updatedAt, deletedAt: r.deletedAt,
});

export class ServiceOrderRepository implements IServiceOrderRepository {
  async findById(id: string): Promise<ServiceOrder | null> {
    const [r] = await db.select().from(serviceOrders).where(and(eq(serviceOrders.id, id), isNull(serviceOrders.deletedAt))).limit(1);
    return r ? mapSO(r) : null;
  }
  async list(f: ListServiceOrdersFilters): Promise<PaginatedResult<ServiceOrder>> {
    const { page, limit, offset } = paginate(f);
    const conds = [isNull(serviceOrders.deletedAt)];
    if (f.customerId) conds.push(eq(serviceOrders.customerId, f.customerId));
    if (f.employeeId) conds.push(eq(serviceOrders.employeeId, f.employeeId));
    if (f.status) conds.push(eq(serviceOrders.status, f.status));
    if (f.from) conds.push(gte(serviceOrders.createdAt, f.from));
    if (f.to) conds.push(lte(serviceOrders.createdAt, f.to));
    const where = and(...conds);
    const rows = await db.select().from(serviceOrders).where(where).limit(limit).offset(offset);
    const [{ c } = { c: 0 }] = await db.select({ c: count() }).from(serviceOrders).where(where);
    return { data: rows.map(mapSO), meta: buildPaginationMeta(page, limit, Number(c)) };
  }
  async create(input: CreateServiceOrderInput): Promise<ServiceOrder> {
    return await db.transaction(async (tx) => {
      const [so] = await tx.insert(serviceOrders).values({
        customerId: input.customerId,
        vehicleId: input.vehicleId,
        employeeId: input.employeeId,
        notes: input.notes,
      }).returning();
      if (!so) throw new Error("Failed to create SO");
      if (input.items.length > 0) {
        await tx.insert(serviceOrderItems).values(input.items.map((it) => ({ ...it, serviceOrderId: so.id })));
      }
      return mapSO(so);
    });
  }
  async updateStatus(input: UpdateServiceOrderStatusInput): Promise<ServiceOrder> {
    const patch: Partial<typeof serviceOrders.$inferInsert> = { status: input.status, updatedAt: new Date() };
    if (input.status === "IN_PROGRESS") patch.startedAt = new Date();
    if (input.status === "DONE" || input.status === "DELIVERED") patch.finishedAt = new Date();
    const [r] = await db.update(serviceOrders).set(patch).where(eq(serviceOrders.id, input.orderId)).returning();
    if (!r) throw new Error("SO not found");
    return mapSO(r);
  }
  async softDelete(id: string): Promise<void> {
    await db.update(serviceOrders).set({ deletedAt: new Date() }).where(eq(serviceOrders.id, id));
  }
  async listByCustomer(customerId: string): Promise<ServiceOrder[]> {
    const rows = await db.select().from(serviceOrders).where(and(eq(serviceOrders.customerId, customerId), isNull(serviceOrders.deletedAt)));
    return rows.map(mapSO);
  }
}
