import { integer, numeric, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { customers, vehicles } from "./customers.schema";
import { products, serviceTypes } from "./inventory.schema";
import { users } from "./users.schema";
import { fileUploads } from "./uploads.schema";

export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "IN_PROGRESS",
  "DONE",
  "DELIVERED",
  "CANCELLED",
]);

export const serviceOrders = pgTable("service_orders", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  customerId: text("customer_id").notNull().references(() => customers.id),
  vehicleId: text("vehicle_id").notNull().references(() => vehicles.id),
  employeeId: text("employee_id").references(() => users.id),
  status: orderStatusEnum("status").notNull().default("PENDING"),
  notes: text("notes"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const serviceOrderItems = pgTable("service_order_items", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  serviceOrderId: text("service_order_id").notNull().references(() => serviceOrders.id, { onDelete: "cascade" }),
  serviceTypeId: text("service_type_id").references(() => serviceTypes.id),
  productId: text("product_id").references(() => products.id),
  qty: integer("qty").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull().default("0"),
});

export const servicePhotos = pgTable("service_photos", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  serviceOrderId: text("service_order_id").notNull().references(() => serviceOrders.id, { onDelete: "cascade" }),
  uploadId: text("upload_id").notNull().references(() => fileUploads.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
