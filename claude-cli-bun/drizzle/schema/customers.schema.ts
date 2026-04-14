import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { fileUploads } from "./uploads.schema";

export const customers = pgTable("customers", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  document: text("document"),
  phone: text("phone"),
  email: text("email"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const vehicles = pgTable("vehicles", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  customerId: text("customer_id").notNull().references(() => customers.id),
  plate: text("plate").notNull(),
  make: text("make"),
  model: text("model"),
  year: text("year"),
  color: text("color"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const vehiclePhotos = pgTable("vehicle_photos", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  vehicleId: text("vehicle_id").notNull().references(() => vehicles.id),
  uploadId: text("upload_id").notNull().references(() => fileUploads.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
