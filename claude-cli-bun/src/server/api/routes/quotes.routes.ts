import { Elysia, t } from "elysia";
import { extractUser, requireAuth } from "../plugins/auth";
import { quoteRepository } from "@/server/infrastructure/repositories";
import { success } from "@/lib/utils/response";

export const quoteRoutes = new Elysia({ prefix: "/orcamentos" })
  .get("/", async ({ headers, query }) => {
    requireAuth(await extractUser(headers));
    const r = await quoteRepository.list({ page: Number(query.page ?? 1), limit: Number(query.limit ?? 20) });
    return success(r.data, r.meta);
  })
  .get("/:id", async ({ headers, params }) => {
    requireAuth(await extractUser(headers));
    return success(await quoteRepository.findById(params.id));
  })
  .post("/", async ({ headers, body }) => {
    requireAuth(await extractUser(headers));
    return success(await quoteRepository.create({
      customerId: body.customerId,
      vehicleId: body.vehicleId,
      notes: body.notes,
      items: body.items.map((it) => ({
        serviceTypeId: it.serviceTypeId ?? null,
        productId: it.productId ?? null,
        description: it.description,
        qty: it.qty,
        unitPrice: it.unitPrice,
      })),
    }));
  }, { body: t.Object({
    customerId: t.String(),
    vehicleId: t.Optional(t.String()),
    notes: t.Optional(t.String()),
    items: t.Array(t.Object({
      serviceTypeId: t.Optional(t.String()),
      productId: t.Optional(t.String()),
      description: t.String(),
      qty: t.Number(),
      unitPrice: t.String(),
    })),
  }) })
  .patch("/:id", async ({ headers, params, body }) => {
    requireAuth(await extractUser(headers));
    return success(await quoteRepository.update(params.id, body));
  }, { body: t.Object({ status: t.Optional(t.Union([t.Literal("DRAFT"), t.Literal("SENT"), t.Literal("ACCEPTED"), t.Literal("REJECTED")])), notes: t.Optional(t.String()) }) })
  .get("/:id/pdf", async ({ headers, params, set }) => {
    requireAuth(await extractUser(headers));
    const q = await quoteRepository.findById(params.id);
    set.headers["content-type"] = "application/pdf";
    return new Blob([`%PDF-1.4\n% Quote ${q?.id ?? params.id}\n% TODO: real PDF via @react-pdf/renderer\n%%EOF`]);
  });
