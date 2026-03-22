import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { storage, validateFile } from "@/lib/storage";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/utils";
import { createId } from "@paralleldrive/cuid2";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return errorResponse("UNAUTHORIZED", "Não autorizado", 401);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return errorResponse("VALIDATION", "Arquivo é obrigatório", 400);

    const validation = validateFile(file);
    if (!validation.valid) return errorResponse("VALIDATION", validation.error!, 400);

    const ext = file.name.split(".").pop() || "bin";
    const filename = `${createId()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const url = await storage.upload(buffer, filename, file.type);

    const upload = await prisma.fileUpload.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url,
      },
    });

    return successResponse(upload);
  } catch (error) {
    return errorResponse("INTERNAL", "Erro ao fazer upload", 500, error);
  }
}
