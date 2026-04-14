import { integer, numeric, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { customers, vehicles } from "./customers.schema";
import { products, serviceTypes } from "./inventory.schema";

export const quoteStatusEnum = pgEnum("quote_status", ["DRAFT", "SENT", "ACCEPTED", "REJECTED"]);

export const quotes = pgTable("quotes", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  customerId: text("customer_id").notNull().references(() => customers.id),
  vehicleId: text("vehicle_id").references(() => vehicles.id),
  status: quoteStatusEnum("status").notNull().default("DRAFT"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const quoteItems = pgTable("quote_items", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  quoteId: text("quote_id").notNull().references(() => quotes.id, { onDelete: "cascade" }),
  serviceTypeId: text("service_type_id").references(() => serviceTypes.id),
  productId: text("product_id").references(() => products.id),
  description: text("description").notNull(),
  qty: integer("qty").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull().default("0"),
});
