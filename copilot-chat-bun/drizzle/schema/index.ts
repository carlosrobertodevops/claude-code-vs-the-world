import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["MANAGER", "EMPLOYEE"]);
export const quoteStatusEnum = pgEnum("quote_status", ["DRAFT", "SENT", "APPROVED"]);
export const contractStatusEnum = pgEnum("contract_status", ["PENDING", "SIGNED"]);
export const serviceOrderStatusEnum = pgEnum("service_order_status", [
  "WAITING",
  "IN_PROGRESS",
  "DONE",
  "DELIVERED",
]);
export const queueStatusEnum = pgEnum("queue_status", [
  "QUEUED",
  "WASHING",
  "READY",
  "DELIVERED",
]);
export const fileTypeEnum = pgEnum("file_type", [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 160 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)],
);

export const customers = pgTable(
  "customers",
  {
    id: text("id").primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    document: varchar("document", { length: 32 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    email: varchar("email", { length: 160 }).notNull(),
    address: text("address").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("customers_document_idx").on(table.document)],
);

export const vehicles = pgTable(
  "vehicles",
  {
    id: text("id").primaryKey(),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    brand: varchar("brand", { length: 80 }).notNull(),
    model: varchar("model", { length: 80 }).notNull(),
    plate: varchar("plate", { length: 16 }).notNull(),
    color: varchar("color", { length: 40 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("vehicles_plate_idx").on(table.plate)],
);

export const vehiclePhotos = pgTable("vehicle_photos", {
  id: text("id").primaryKey(),
  vehicleId: text("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    sku: varchar("sku", { length: 40 }).notNull(),
    unit: varchar("unit", { length: 16 }).notNull(),
    stock: integer("stock").notNull().default(0),
    minimumStock: integer("minimum_stock").notNull().default(0),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [uniqueIndex("products_sku_idx").on(table.sku)],
);

export const stockMovements = pgTable("stock_movements", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 16 }).notNull(),
  quantity: integer("quantity").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const serviceTypes = pgTable("service_types", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description").notNull(),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
});

export const quotes = pgTable("quotes", {
  id: text("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  vehicleId: text("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  status: quoteStatusEnum("status").notNull(),
  validUntil: timestamp("valid_until", { withTimezone: true }).notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
});

export const quoteItems = pgTable("quote_items", {
  id: text("id").primaryKey(),
  quoteId: text("quote_id")
    .notNull()
    .references(() => quotes.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
});

export const contracts = pgTable("contracts", {
  id: text("id").primaryKey(),
  quoteId: text("quote_id")
    .notNull()
    .references(() => quotes.id, { onDelete: "cascade" }),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  status: contractStatusEnum("status").notNull(),
  signedAt: timestamp("signed_at", { withTimezone: true }),
  notes: text("notes").notNull(),
});

export const serviceOrders = pgTable("service_orders", {
  id: text("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  vehicleId: text("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  assignedEmployeeId: text("assigned_employee_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  status: serviceOrderStatusEnum("status").notNull(),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const serviceOrderItems = pgTable("service_order_items", {
  id: text("id").primaryKey(),
  serviceOrderId: text("service_order_id")
    .notNull()
    .references(() => serviceOrders.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
});

export const servicePhotos = pgTable("service_photos", {
  id: text("id").primaryKey(),
  serviceOrderId: text("service_order_id")
    .notNull()
    .references(() => serviceOrders.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const queueEntries = pgTable("queue_entries", {
  id: text("id").primaryKey(),
  serviceOrderId: text("service_order_id")
    .notNull()
    .references(() => serviceOrders.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  status: queueStatusEnum("status").notNull(),
  etaMinutes: integer("eta_minutes").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const carWashConfigs = pgTable("car_wash_configs", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull(),
  address: text("address").notNull(),
  themeAccent: varchar("theme_accent", { length: 16 }).notNull(),
  darkBackground: varchar("dark_background", { length: 16 }).notNull(),
  lightBackground: varchar("light_background", { length: 16 }).notNull(),
  publicQueueEnabled: boolean("public_queue_enabled").notNull().default(true),
});

export const fileUploads = pgTable("file_uploads", {
  id: text("id").primaryKey(),
  fileName: text("file_name").notNull(),
  mimeType: fileTypeEnum("mime_type").notNull(),
  size: integer("size").notNull(),
  path: text("path").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
