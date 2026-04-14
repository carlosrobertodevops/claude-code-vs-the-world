import { Elysia, t } from "elysia";
import { extractUser, requireAuth } from "../plugins/auth";
import { productRepository } from "@/server/infrastructure/repositories";
import { db } from "@/server/infrastructure/drizzle/client";
import { serviceTypes } from "../../../../drizzle/schema";
import { success } from "@/lib/utils/response";
import { eq } from "drizzle-orm";

export const inventoryRoutes = new Elysia({ prefix: "/inventario" })
  .get("/produtos", async ({ headers, query }) => {
    requireAuth(await extractUser(headers));
    const result = await productRepository.list({ page: Number(query.page ?? 1), limit: Number(query.limit ?? 20) });
    return success(result.data, result.meta);
  })
  .get("/produtos/baixo-estoque", async ({ headers }) => {
    requireAuth(await extractUser(headers));
    return success(await productRepository.listLowStock());
  })
  .post("/produtos", async ({ headers, body }) => {
    requireAuth(await extractUser(headers));
    return success(await productRepository.create(body));
  }, { body: t.Object({ name: t.String(), sku: t.Optional(t.String()), unit: t.Optional(t.String()), price: t.Optional(t.String()), stockQty: t.Optional(t.Number()), minStock: t.Optional(t.Number()) }) })
  .patch("/produtos/:id", async ({ headers, params, body }) => {
    requireAuth(await extractUser(headers));
    return success(await productRepository.update(params.id, body));
  }, { body: t.Object({ name: t.Optional(t.String()), sku: t.Optional(t.String()), unit: t.Optional(t.String()), price: t.Optional(t.String()), stockQty: t.Optional(t.Number()), minStock: t.Optional(t.Number()) }) })
  .delete("/produtos/:id", async ({ headers, params }) => {
    requireAuth(await extractUser(headers));
    await productRepository.softDelete(params.id);
    return success({ id: params.id });
  })
  .post("/produtos/:id/estoque", async ({ headers, params, body }) => {
    const u = requireAuth(await extractUser(headers));
    const mov = await productRepository.updateStock({ productId: params.id, qtyDelta: body.qtyDelta, reason: body.reason, userId: u.id });
    return success(mov);
  }, { body: t.Object({ qtyDelta: t.Number(), reason: t.String() }) })
  .get("/servicos", async ({ headers }) => {
    requireAuth(await extractUser(headers));
    return success(await db.select().from(serviceTypes));
  })
  .post("/servicos", async ({ headers, body }) => {
    requireAuth(await extractUser(headers));
    const [r] = await db.insert(serviceTypes).values(body).returning();
    return success(r);
  }, { body: t.Object({ name: t.String(), description: t.Optional(t.String()), basePrice: t.Optional(t.String()), durationMinutes: t.Optional(t.Number()) }) })
  .patch("/servicos/:id", async ({ headers, params, body }) => {
    requireAuth(await extractUser(headers));
    const [r] = await db.update(serviceTypes).set({ ...body, updatedAt: new Date() }).where(eq(serviceTypes.id, params.id)).returning();
    return success(r);
  }, { body: t.Object({ name: t.Optional(t.String()), description: t.Optional(t.String()), basePrice: t.Optional(t.String()), durationMinutes: t.Optional(t.Number()) }) })
  .delete("/servicos/:id", async ({ headers, params }) => {
    requireAuth(await extractUser(headers));
    await db.delete(serviceTypes).where(eq(serviceTypes.id, params.id));
    return success({ id: params.id });
  });
