import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createId } from "@paralleldrive/cuid2";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { uploadMimeTypes } from "@/lib/constants";

export type StoredFile = {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
};

function validateFile(file: File) {
  const maxSize = Number(process.env.MAX_UPLOAD_SIZE_MB ?? 10) * 1024 * 1024;
  if (!uploadMimeTypes.includes(file.type)) {
    throw new Error("Tipo de arquivo nao permitido.");
  }
  if (file.size > maxSize) {
    throw new Error("Arquivo excede o tamanho maximo permitido.");
  }
}

async function saveLocally(file: File): Promise<StoredFile> {
  const uploadDir = process.env.UPLOAD_DIR ?? "public/uploads";
  await mkdir(uploadDir, { recursive: true });
  const ext = path.extname(file.name) || ".bin";
  const filename = `${createId()}${ext}`;
  const destination = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(destination, buffer);

  return {
    filename,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    url: `/${uploadDir.replace(/^public\//, "")}/${filename}`,
  };
}

async function saveToS3(file: File): Promise<StoredFile> {
  const client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    forcePathStyle: String(process.env.S3_FORCE_PATH_STYLE) === "true",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY ?? "",
      secretAccessKey: process.env.S3_SECRET_KEY ?? "",
    },
  });

  const ext = path.extname(file.name) || ".bin";
  const filename = `${createId()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const bucket = process.env.S3_BUCKET ?? "jatoflow";

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    }),
  );

  return {
    filename,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    url: `${process.env.S3_ENDPOINT}/${bucket}/${filename}`,
  };
}

export async function uploadFile(file: File) {
  validateFile(file);
  if ((process.env.STORAGE_PROVIDER ?? "local") === "s3") {
    return saveToS3(file);
  }
  return saveLocally(file);
}
