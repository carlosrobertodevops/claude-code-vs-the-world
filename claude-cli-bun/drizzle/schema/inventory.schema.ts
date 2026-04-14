import { integer, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users.schema";

export const products = pgTable("products", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  sku: text("sku"),
  unit: text("unit").notNull().default("un"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0"),
  stockQty: integer("stock_qty").notNull().default(0),
  minStock: integer("min_stock").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const stockMovements = pgTable("stock_movements", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  productId: text("product_id").notNull().references(() => products.id),
  qtyDelta: integer("qty_delta").notNull(),
  reason: text("reason").notNull(),
  refServiceOrderId: text("ref_service_order_id"),
  userId: text("user_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const serviceTypes = pgTable("service_types", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description"),
  basePrice: numeric("base_price", { precision: 12, scale: 2 }).notNull().default("0"),
  durationMinutes: integer("duration_minutes").notNull().default(30),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
