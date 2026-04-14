import { Elysia, t } from "elysia";
import { extractUser, requireAuth } from "../plugins/auth";
import { queueRepository } from "@/server/infrastructure/repositories";
import { success } from "@/lib/utils/response";

export const queueRoutes = new Elysia({ prefix: "/fila" })
  .get("/publica/:slug", async ({ params }) => success(await queueRepository.getPublic(params.slug)))
  .get("/:slug", async ({ headers, params }) => {
    requireAuth(await extractUser(headers));
    return success(await queueRepository.listBySlug(params.slug));
  })
  .post("/", async ({ headers, body }) => {
    requireAuth(await extractUser(headers));
    return success(await queueRepository.addEntry(body));
  }, { body: t.Object({ serviceOrderId: t.String(), slug: t.String() }) })
  .patch("/:id", async ({ headers, params, body }) => {
    requireAuth(await extractUser(headers));
    return success(await queueRepository.move({ entryId: params.id, newPosition: body.position }));
  }, { body: t.Object({ position: t.Number() }) })
  .delete("/:id", async ({ headers, params }) => {
    requireAuth(await extractUser(headers));
    await queueRepository.remove(params.id);
    return success({ id: params.id });
  });
