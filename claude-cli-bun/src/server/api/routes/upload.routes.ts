import { Elysia, t } from "elysia";
import { extractUser, requireAuth } from "../plugins/auth";
import { getStorage } from "@/server/infrastructure/storage/storage.factory";
import { uploadRepository } from "@/server/infrastructure/repositories";
import { newId } from "@/lib/utils/cuid";
import { ValidationError } from "@/lib/errors";
import { success } from "@/lib/utils/response";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_SIZE = 10 * 1024 * 1024;

export const uploadRoutes = new Elysia({ prefix: "/upload" })
  .post("/", async ({ headers, body }) => {
    const u = requireAuth(await extractUser(headers));
    const file = body.file;
    if (!ALLOWED.has(file.type)) throw new ValidationError(`MIME not allowed: ${file.type}`);
    if (file.size > MAX_SIZE) throw new ValidationError("File too large (>10MB)");
    const ext = file.type.split("/")[1] ?? "bin";
    const key = `${newId()}.${ext}`;
    const buf = await file.arrayBuffer();
    const uploaded = await getStorage().upload({ key, mime: file.type, body: buf });
    const record = await uploadRepository.create({
      storageKey: uploaded.key, mime: file.type, size: file.size, uploadedBy: u.id,
    });
    return success({ ...record, url: uploaded.url });
  }, { body: t.Object({ file: t.File() }) });
