import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { serviceOrders } from "./service-orders.schema";

export const queueStatusEnum = pgEnum("queue_status", ["WAITING", "IN_SERVICE", "DONE"]);

export const queueEntries = pgTable("queue_entries", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  serviceOrderId: text("service_order_id").notNull().references(() => serviceOrders.id),
  slug: text("slug").notNull(),
  position: integer("position").notNull().default(0),
  status: queueStatusEnum("status").notNull().default("WAITING"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
