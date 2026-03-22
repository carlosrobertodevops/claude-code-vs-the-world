import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { createId } from "@paralleldrive/cuid2";

interface StorageProvider {
  upload(file: Buffer, originalName: string, mimeType: string): Promise<string>;
  delete(url: string): Promise<void>;
}

class LocalStorageProvider implements StorageProvider {
  private uploadDir = join(process.cwd(), "public", "uploads");

  async upload(file: Buffer, originalName: string, _mimeType: string): Promise<string> {
    await mkdir(this.uploadDir, { recursive: true });
    const ext = originalName.split(".").pop() || "bin";
    const filename = `${createId()}.${ext}`;
    const filepath = join(this.uploadDir, filename);
    await writeFile(filepath, file);
    return `/uploads/${filename}`;
  }

  async delete(url: string): Promise<void> {
    const filename = url.replace("/uploads/", "");
    const filepath = join(this.uploadDir, filename);
    try {
      await unlink(filepath);
    } catch {
      // File may not exist
    }
  }
}

function getStorageProvider(): StorageProvider {
  return new LocalStorageProvider();
}

export const storage = getStorageProvider();
