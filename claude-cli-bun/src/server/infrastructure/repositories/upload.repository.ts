import { eq } from "drizzle-orm";
import { db } from "../drizzle/client";
import { fileUploads } from "../../../../drizzle/schema";
import type { CreateUploadInput, FileUploadRecord, IUploadRepository } from "@/server/domain/repositories/IUploadRepository";

const map = (r: typeof fileUploads.$inferSelect): FileUploadRecord => ({
  id: r.id, storageKey: r.storageKey, mime: r.mime, size: r.size, uploadedBy: r.uploadedBy, createdAt: r.createdAt,
});

export class UploadRepository implements IUploadRepository {
  async findById(id: string): Promise<FileUploadRecord | null> {
    const [r] = await db.select().from(fileUploads).where(eq(fileUploads.id, id)).limit(1);
    return r ? map(r) : null;
  }
  async create(input: CreateUploadInput): Promise<FileUploadRecord> {
    const [r] = await db.insert(fileUploads).values(input).returning();
    if (!r) throw new Error("Failed to create upload");
    return map(r);
  }
  async deleteByKey(storageKey: string): Promise<void> {
    await db.delete(fileUploads).where(eq(fileUploads.storageKey, storageKey));
  }
}

export const uploadRepository = new UploadRepository();
