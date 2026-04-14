export interface FileUploadRecord {
  id: string;
  storageKey: string;
  mime: string;
  size: number;
  uploadedBy: string | null;
  createdAt: Date;
}

export interface CreateUploadInput {
  storageKey: string;
  mime: string;
  size: number;
  uploadedBy?: string;
}

export interface IUploadRepository {
  findById(id: string): Promise<FileUploadRecord | null>;
  create(input: CreateUploadInput): Promise<FileUploadRecord>;
  deleteByKey(storageKey: string): Promise<void>;
}
