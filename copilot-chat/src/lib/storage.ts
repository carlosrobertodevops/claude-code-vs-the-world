import fs from "fs/promises";
import path from "path";
import { createId } from "@paralleldrive/cuid2";

export interface StorageProvider {
  upload(file: Buffer, originalName: string, mimeType: string): Promise<string>;
  delete(url: string): Promise<void>;
}

class LocalStorage implements StorageProvider {
  private uploadDir = path.join(process.cwd(), "public", "uploads");

  async upload(file: Buffer, originalName: string, _mimeType: string): Promise<string> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    const ext = path.extname(originalName);
    const filename = `${createId()}${ext}`;
    const filePath = path.join(this.uploadDir, filename);
    await fs.writeFile(filePath, file);
    return `/uploads/${filename}`;
  }

  async delete(url: string): Promise<void> {
    const filename = url.replace("/uploads/", "");
    const filePath = path.join(this.uploadDir, filename);
    await fs.unlink(filePath).catch(() => {});
  }
}

function getStorage(): StorageProvider {
  return new LocalStorage();
}

export const storage = getStorage();
