import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { customers } from "./customers.schema";
import { quotes } from "./quotes.schema";

export const contractStatusEnum = pgEnum("contract_status", ["PENDING", "SIGNED", "CANCELLED"]);

export const contracts = pgTable("contracts", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  customerId: text("customer_id").notNull().references(() => customers.id),
  quoteId: text("quote_id").references(() => quotes.id),
  status: contractStatusEnum("status").notNull().default("PENDING"),
  signedAt: timestamp("signed_at", { withTimezone: true }),
  signatureToken: text("signature_token").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
