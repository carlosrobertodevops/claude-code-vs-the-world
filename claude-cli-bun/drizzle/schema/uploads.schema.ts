import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./users.schema";

export const fileUploads = pgTable("file_uploads", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  storageKey: text("storage_key").notNull().unique(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  uploadedBy: text("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
