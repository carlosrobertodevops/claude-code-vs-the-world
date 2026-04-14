import type { IStorageProvider } from "./IStorageProvider";
import { LocalStorageProvider } from "./LocalStorageProvider";
import { MinIOStorageProvider } from "./MinIOStorageProvider";

let cached: IStorageProvider | null = null;

export function getStorage(): IStorageProvider {
  if (cached) return cached;
  const provider = (process.env.STORAGE_PROVIDER ?? "local").toLowerCase();
  cached = provider === "minio" ? new MinIOStorageProvider() : new LocalStorageProvider();
  return cached;
}
