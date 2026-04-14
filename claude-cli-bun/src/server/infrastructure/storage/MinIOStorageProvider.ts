import type { IStorageProvider, UploadInput, UploadResult } from "./IStorageProvider";

/**
 * Minimal MinIO provider — uses fetch + pre-signed URLs via SigV4.
 * TODO: Replace with full MinIO SDK if advanced features needed.
 * For v1 this is a placeholder implementation — enable when STORAGE_PROVIDER=minio
 * and MINIO_* env vars are configured.
 */
export class MinIOStorageProvider implements IStorageProvider {
  private readonly endpoint: string;
  private readonly bucket: string;
  private readonly accessKey: string;
  private readonly secretKey: string;

  constructor() {
    this.endpoint = process.env.MINIO_ENDPOINT ?? "http://localhost:9000";
    this.bucket = process.env.MINIO_BUCKET ?? "lavaflow";
    this.accessKey = process.env.MINIO_ACCESS_KEY ?? "";
    this.secretKey = process.env.MINIO_SECRET_KEY ?? "";
  }

  async upload(_input: UploadInput): Promise<UploadResult> {
    throw new Error("MinIOStorageProvider.upload not implemented — use LocalStorageProvider in v1");
  }

  async delete(_key: string): Promise<void> {
    throw new Error("MinIOStorageProvider.delete not implemented — use LocalStorageProvider in v1");
  }

  getUrl(key: string): string {
    return `${this.endpoint}/${this.bucket}/${key}`;
  }
}
