import { pgTable, uuid, varchar, text, timestamp, numeric, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 50 }).notNull(), // 'MANAGER', 'EMPLOYEE'
  phone: varchar('phone', { length: 20 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Customers
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }).notNull(),
  cpfCnpj: varchar('cpf_cnpj', { length: 20 }).unique(),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Vehicles
export const vehicles = pgTable('vehicles', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  plate: varchar('plate', { length: 10 }).notNull().unique(),
  brand: varchar('brand', { length: 100 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  year: integer('year'),
  color: varchar('color', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Vehicle Photos
export const vehiclePhotos = pgTable('vehicle_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  vehicleId: uuid('vehicle_id').references(() => vehicles.id).notNull(),
  url: text('url').notNull(),
  caption: text('caption'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Products
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  unit: varchar('unit', { length: 20 }).notNull(), // 'L', 'Kg', 'Un', etc
  currentStock: numeric('current_stock').notNull().default('0'),
  minimumStock: numeric('minimum_stock').notNull().default('0'),
  costPrice: numeric('cost_price').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Stock Movements
export const stockMovements = pgTable('stock_movements', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'IN', 'OUT', 'ADJUSTMENT'
  quantity: numeric('quantity').notNull(),
  unitCost: numeric('unit_cost'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Service Types
export const serviceTypes = pgTable('service_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  basePrice: numeric('base_price').notNull(),
  estimatedMinutes: integer('estimated_minutes').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Quotes
export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  quoteNumber: varchar('quote_number', { length: 20 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull(), // 'DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'
  totalAmount: numeric('total_amount').notNull().default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Quote Items
export const quoteItems = pgTable('quote_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id').references(() => quotes.id).notNull(),
  serviceTypeId: uuid('service_type_id').references(() => serviceTypes.id),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: numeric('unit_price').notNull(),
  discount: numeric('discount').default('0'),
  subtotal: numeric('subtotal').notNull(),
});

// Contracts
export const contracts = pgTable('contracts', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  contractNumber: varchar('contract_number', { length: 20 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull(), // 'DRAFT', 'PENDING_SIGNATURE', 'SIGNED', 'CANCELLED'
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  signatureData: text('signature_data'),
  signatureIp: varchar('signature_ip', { length: 45 }),
  pdfUrl: text('pdf_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Service Orders
export const serviceOrders = pgTable('service_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  vehicleId: uuid('vehicle_id').references(() => vehicles.id).notNull(),
  employeeId: uuid('employee_id').references(() => users.id).notNull(),
  orderNumber: varchar('order_number', { length: 20 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull(), // 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
  totalAmount: numeric('total_amount').notNull().default('0'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Service Order Items
export const serviceOrderItems = pgTable('service_order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceOrderId: uuid('service_order_id').references(() => serviceOrders.id).notNull(),
  serviceTypeId: uuid('service_type_id').references(() => serviceTypes.id),
  productId: uuid('product_id').references(() => products.id),
  description: text('description'),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: numeric('unit_price').notNull(),
  subtotal: numeric('subtotal').notNull(),
});

// Service Photos
export const servicePhotos = pgTable('service_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceOrderId: uuid('service_order_id').references(() => serviceOrders.id).notNull(),
  url: text('url').notNull(),
  caption: text('caption'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Queue Entries
export const queueEntries = pgTable('queue_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceOrderId: uuid('service_order_id').references(() => serviceOrders.id).unique().notNull(),
  position: integer('position').notNull(),
  estimatedStart: timestamp('estimated_start'),
  estimatedEnd: timestamp('estimated_end'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Car Wash Configuration
export const carWashConfig = pgTable('car_wash_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  simultaneousSlots: integer('simultaneous_slots').notNull().default(1),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  logoUrl: text('logo_url'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// File Uploads
export const fileUploads = pgTable('file_uploads', {
  id: uuid('id').primaryKey().defaultRandom(),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  serviceOrders: many(serviceOrders),
  stockMovements: many(stockMovements),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  vehicles: many(vehicles),
  quotes: many(quotes),
  contracts: many(contracts),
  serviceOrders: many(serviceOrders),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  customer: one(customers, { fields: [vehicles.customerId], references: [customers.id] }),
  photos: many(vehiclePhotos),
  serviceOrders: many(serviceOrders),
}));

export const vehiclePhotosRelations = relations(vehiclePhotos, ({ one }) => ({
  vehicle: one(vehicles, { fields: [vehiclePhotos.vehicleId], references: [vehicles.id] }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  stockMovements: many(stockMovements),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  product: one(products, { fields: [stockMovements.productId], references: [products.id] }),
  user: one(users, { fields: [stockMovements.userId], references: [users.id] }),
}));

export const serviceTypesRelations = relations(serviceTypes, ({ many }) => ({
  quoteItems: many(quoteItems),
  serviceOrderItems: many(serviceOrderItems),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  customer: one(customers, { fields: [quotes.customerId], references: [customers.id] }),
  items: many(quoteItems),
}));

export const quoteItemsRelations = relations(quoteItems, ({ one }) => ({
  quote: one(quotes, { fields: [quoteItems.quoteId], references: [quotes.id] }),
  serviceType: one(serviceTypes, { fields: [quoteItems.serviceTypeId], references: [serviceTypes.id] }),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  customer: one(customers, { fields: [contracts.customerId], references: [customers.id] }),
}));

export const serviceOrdersRelations = relations(serviceOrders, ({ one, many }) => ({
  customer: one(customers, { fields: [serviceOrders.customerId], references: [customers.id] }),
  vehicle: one(vehicles, { fields: [serviceOrders.vehicleId], references: [vehicles.id] }),
  employee: one(users, { fields: [serviceOrders.employeeId], references: [users.id] }),
  items: many(serviceOrderItems),
  photos: many(servicePhotos),
  queueEntry: one(queueEntries),
}));

export const serviceOrderItemsRelations = relations(serviceOrderItems, ({ one }) => ({
  serviceOrder: one(serviceOrders, { fields: [serviceOrderItems.serviceOrderId], references: [serviceOrders.id] }),
  serviceType: one(serviceTypes, { fields: [serviceOrderItems.serviceTypeId], references: [serviceTypes.id] }),
  product: one(products, { fields: [serviceOrderItems.productId], references: [products.id] }),
}));

export const servicePhotosRelations = relations(servicePhotos, ({ one }) => ({
  serviceOrder: one(serviceOrders, { fields: [servicePhotos.serviceOrderId], references: [serviceOrders.id] }),
}));

export const queueEntriesRelations = relations(queueEntries, ({ one }) => ({
  serviceOrder: one(serviceOrders, { fields: [queueEntries.serviceOrderId], references: [serviceOrders.id] }),
}));
