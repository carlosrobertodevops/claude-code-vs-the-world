import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "MISSING_FILE", message: "Nenhum arquivo enviado" },
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TYPE",
            message:
              "Tipo de arquivo nao permitido. Tipos aceitos: JPG, PNG, WebP, PDF",
          },
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: "Arquivo excede o tamanho maximo de 10MB",
          },
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await storage.upload(buffer, file.name, file.type);

    const filename = url.split("/").pop() || file.name;

    const fileUpload = await prisma.fileUpload.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          url: fileUpload.url,
          filename: fileUpload.filename,
          originalName: fileUpload.originalName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Erro ao fazer upload do arquivo",
        },
      },
      { status: 500 }
    );
  }
}
