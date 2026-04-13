import { pgTable, text, timestamp, varchar, decimal, integer, uuid, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ---- ENUMS ----
export const roleEnum = pgEnum('role', ['MANAGER', 'EMPLOYEE']);
export const osStatusEnum = pgEnum('os_status', ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);
export const queueStatusEnum = pgEnum('queue_status', ['WAITING', 'IN_SERVICE', 'FINISHED']);

// ---- TABLES ----
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  role: roleEnum('role').default('EMPLOYEE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  document: varchar('document', { length: 50 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const vehicles = pgTable('vehicles', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  plate: varchar('plate', { length: 20 }).notNull().unique(),
  brand: varchar('brand', { length: 100 }),
  model: varchar('model', { length: 100 }),
  color: varchar('color', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const serviceTypes = pgTable('service_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  estimatedMinutes: integer('estimated_minutes').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const serviceOrders = pgTable('service_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  vehicleId: uuid('vehicle_id').references(() => vehicles.id).notNull(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  status: osStatusEnum('status').default('PENDING').notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const serviceOrderItems = pgTable('service_order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  serviceOrderId: uuid('service_order_id').references(() => serviceOrders.id).notNull(),
  serviceTypeId: uuid('service_type_id').references(() => serviceTypes.id).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
});

export const queueEntries = pgTable('queue_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  vehicleId: uuid('vehicle_id').references(() => vehicles.id).notNull(),
  status: queueStatusEnum('status').default('WAITING').notNull(),
  position: integer('position').notNull(),
  enteredAt: timestamp('entered_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// Relationships
export const customersRelations = relations(customers, ({ many }) => ({
  vehicles: many(vehicles),
  serviceOrders: many(serviceOrders),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  customer: one(customers, {
    fields: [vehicles.customerId],
    references: [customers.id],
  }),
  serviceOrders: many(serviceOrders),
  queueEntries: many(queueEntries),
}));

export const serviceOrdersRelations = relations(serviceOrders, ({ one, many }) => ({
  vehicle: one(vehicles, {
    fields: [serviceOrders.vehicleId],
    references: [vehicles.id],
  }),
  customer: one(customers, {
    fields: [serviceOrders.customerId],
    references: [customers.id],
  }),
  items: many(serviceOrderItems),
}));

export const serviceOrderItemsRelations = relations(serviceOrderItems, ({ one }) => ({
  serviceOrder: one(serviceOrders, {
    fields: [serviceOrderItems.serviceOrderId],
    references: [serviceOrders.id],
  }),
  serviceType: one(serviceTypes, {
    fields: [serviceOrderItems.serviceTypeId],
    references: [serviceTypes.id],
  }),
}));
