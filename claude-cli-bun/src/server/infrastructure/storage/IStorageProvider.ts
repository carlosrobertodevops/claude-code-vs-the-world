export interface UploadInput {
  key: string;
  mime: string;
  body: ArrayBuffer | Uint8Array | Buffer;
}

export interface UploadResult {
  key: string;
  url: string;
}

export interface IStorageProvider {
  upload(input: UploadInput): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}
