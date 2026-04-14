import { Elysia, t } from "elysia";
import { extractUser, requireAuth } from "../plugins/auth";
import { serviceOrderRepository } from "@/server/infrastructure/repositories";
import { success } from "@/lib/utils/response";
import type { OrderStatus } from "@/lib/types/common.types";

export const serviceOrderRoutes = new Elysia({ prefix: "/servicos" })
  .get("/", async ({ headers, query }) => {
    requireAuth(await extractUser(headers));
    const result = await serviceOrderRepository.list({
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 50),
      status: query.status as OrderStatus | undefined,
    });
    return success(result.data, result.meta);
  })
  .post("/", async ({ headers, body }) => {
    requireAuth(await extractUser(headers));
    return success(await serviceOrderRepository.create({
      customerId: body.customerId,
      vehicleId: body.vehicleId,
      employeeId: body.employeeId,
      notes: body.notes,
      items: body.items.map((it) => ({
        serviceTypeId: it.serviceTypeId ?? null,
        productId: it.productId ?? null,
        qty: it.qty,
        unitPrice: it.unitPrice,
      })),
    }));
  }, { body: t.Object({
    customerId: t.String(),
    vehicleId: t.String(),
    employeeId: t.Optional(t.String()),
    notes: t.Optional(t.String()),
    items: t.Array(t.Object({
      serviceTypeId: t.Optional(t.String()),
      productId: t.Optional(t.String()),
      qty: t.Number(),
      unitPrice: t.String(),
    })),
  }) })
  .patch("/:id/status", async ({ headers, params, body }) => {
    requireAuth(await extractUser(headers));
    return success(await serviceOrderRepository.updateStatus({ orderId: params.id, status: body.status }));
  }, { body: t.Object({ status: t.Union([
    t.Literal("PENDING"), t.Literal("IN_PROGRESS"), t.Literal("DONE"), t.Literal("DELIVERED"), t.Literal("CANCELLED"),
  ]) }) });
