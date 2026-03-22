import fs from "fs";
import path from "path";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "./constants";

export interface StorageProvider {
  upload(file: Buffer, filename: string, mimeType: string): Promise<string>;
  delete(url: string): Promise<void>;
  getUrl(filename: string): string;
}

class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Buffer, filename: string): Promise<string> {
    const filePath = path.join(this.uploadDir, filename);
    fs.writeFileSync(filePath, file);
    return `/uploads/${filename}`;
  }

  async delete(url: string): Promise<void> {
    const filename = url.replace("/uploads/", "");
    const filePath = path.join(this.uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}

function getStorageProvider(): StorageProvider {
  return new LocalStorageProvider();
}

export const storage = getStorageProvider();

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Permitidos: ${ALLOWED_FILE_TYPES.join(", ")}`,
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }
  return { valid: true };
}
