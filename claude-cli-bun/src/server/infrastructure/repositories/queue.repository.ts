import { and, asc, eq } from "drizzle-orm";
import { db } from "../drizzle/client";
import { queueEntries, serviceOrders, vehicles } from "../../../../drizzle/schema";
import type { IQueueRepository } from "@/server/domain/repositories/IQueueRepository";
import type { AddToQueueInput, MoveQueueInput, PublicQueueEntry, QueueEntry } from "@/lib/types/queue.types";

const mapEntry = (r: typeof queueEntries.$inferSelect): QueueEntry => ({
  id: r.id, serviceOrderId: r.serviceOrderId, slug: r.slug, position: r.position, status: r.status,
  createdAt: r.createdAt, updatedAt: r.updatedAt,
});

export class QueueRepository implements IQueueRepository {
  async listBySlug(slug: string): Promise<QueueEntry[]> {
    const rows = await db.select().from(queueEntries).where(eq(queueEntries.slug, slug)).orderBy(asc(queueEntries.position));
    return rows.map(mapEntry);
  }
  async addEntry(input: AddToQueueInput): Promise<QueueEntry> {
    const existing = await db.select().from(queueEntries).where(eq(queueEntries.slug, input.slug));
    const nextPos = existing.length + 1;
    const [r] = await db.insert(queueEntries).values({ ...input, position: nextPos }).returning();
    if (!r) throw new Error("Failed to add to queue");
    return mapEntry(r);
  }
  async move(input: MoveQueueInput): Promise<QueueEntry> {
    const [r] = await db.update(queueEntries).set({ position: input.newPosition, updatedAt: new Date() }).where(eq(queueEntries.id, input.entryId)).returning();
    if (!r) throw new Error("Queue entry not found");
    return mapEntry(r);
  }
  async remove(entryId: string): Promise<void> {
    await db.delete(queueEntries).where(eq(queueEntries.id, entryId));
  }
  async getPublic(slug: string): Promise<PublicQueueEntry[]> {
    const rows = await db
      .select({ position: queueEntries.position, status: queueEntries.status, plate: vehicles.plate, model: vehicles.model })
      .from(queueEntries)
      .innerJoin(serviceOrders, eq(serviceOrders.id, queueEntries.serviceOrderId))
      .innerJoin(vehicles, eq(vehicles.id, serviceOrders.vehicleId))
      .where(and(eq(queueEntries.slug, slug)))
      .orderBy(asc(queueEntries.position));
    return rows.map((r) => ({ position: r.position, status: r.status, vehicle: { plate: r.plate, model: r.model } }));
  }
}
