import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { apiError, apiSuccess } from "@/lib/utils";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return apiError("UNAUTHORIZED", "Nao autenticado.", undefined, 401);

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return apiError("VALIDATION_ERROR", "Arquivo nao enviado.", undefined, 422);

  const stored = await uploadFile(file);
  const upload = await prisma.fileUpload.create({ data: stored });
  return apiSuccess(upload);
}
