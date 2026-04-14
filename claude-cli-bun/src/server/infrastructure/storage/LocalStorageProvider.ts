import { writeFile, unlink, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import type { IStorageProvider, UploadInput, UploadResult } from "./IStorageProvider";

const BASE_DIR = join(process.cwd(), "public", "uploads");
const PUBLIC_PREFIX = "/uploads";

export class LocalStorageProvider implements IStorageProvider {
  async upload(input: UploadInput): Promise<UploadResult> {
    const fullPath = join(BASE_DIR, input.key);
    await mkdir(dirname(fullPath), { recursive: true });
    const data =
      input.body instanceof ArrayBuffer ? Buffer.from(input.body) :
      input.body instanceof Uint8Array ? Buffer.from(input.body) :
      input.body;
    await writeFile(fullPath, data);
    return { key: input.key, url: this.getUrl(input.key) };
  }

  async delete(key: string): Promise<void> {
    const fullPath = join(BASE_DIR, key);
    await unlink(fullPath).catch(() => undefined);
  }

  getUrl(key: string): string {
    return `${PUBLIC_PREFIX}/${key}`;
  }
}
