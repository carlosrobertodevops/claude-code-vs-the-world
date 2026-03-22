import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error, requireAuth, handleApiError } from "@/lib/api";
import { storage } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return error("Nenhum arquivo enviado", 400);
    if (!ALLOWED_TYPES.includes(file.type))
      return error("Tipo de arquivo nao permitido", 400);
    if (file.size > MAX_SIZE) return error("Arquivo muito grande (max 10MB)", 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await storage.upload(buffer, file.name, file.type);

    const fileUpload = await prisma.fileUpload.create({
      data: {
        filename: url.split("/").pop() || file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url,
      },
    });

    return success(fileUpload);
  } catch (err) {
    return handleApiError(err);
  }
}
