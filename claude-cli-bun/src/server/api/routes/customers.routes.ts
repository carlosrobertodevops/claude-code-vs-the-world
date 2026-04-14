import { Elysia, t } from "elysia";
import { extractUser, requireAuth } from "../plugins/auth";
import { customerRepository, vehicleRepository } from "@/server/infrastructure/repositories";
import { NotFoundError } from "@/lib/errors";
import { success } from "@/lib/utils/response";

export const customerRoutes = new Elysia({ prefix: "/clientes" })
  .get("/", async ({ headers, query }) => {
    requireAuth(await extractUser(headers));
    const term = (query.q as string | undefined)?.trim();
    const paging = { page: Number(query.page ?? 1), limit: Number(query.limit ?? 20) };
    const result = term ? await customerRepository.searchByTerm(term, paging) : await customerRepository.list(paging);
    return success(result.data, result.meta);
  })
  .get("/:id", async ({ headers, params }) => {
    requireAuth(await extractUser(headers));
    const c = await customerRepository.findById(params.id);
    if (!c) throw new NotFoundError("Customer", params.id);
    const vehicles = await vehicleRepository.listByCustomer(params.id);
    return success({ ...c, vehicles });
  })
  .post("/", async ({ headers, body }) => {
    requireAuth(await extractUser(headers));
    return success(await customerRepository.create(body));
  }, { body: t.Object({ name: t.String(), document: t.Optional(t.String()), phone: t.Optional(t.String()), email: t.Optional(t.String()), notes: t.Optional(t.String()) }) })
  .patch("/:id", async ({ headers, params, body }) => {
    requireAuth(await extractUser(headers));
    return success(await customerRepository.update(params.id, body));
  }, { body: t.Object({ name: t.Optional(t.String()), document: t.Optional(t.String()), phone: t.Optional(t.String()), email: t.Optional(t.String()), notes: t.Optional(t.String()) }) })
  .delete("/:id", async ({ headers, params }) => {
    requireAuth(await extractUser(headers));
    await customerRepository.softDelete(params.id);
    return success({ id: params.id });
  })
  .post("/:id/veiculos", async ({ headers, params, body }) => {
    requireAuth(await extractUser(headers));
    return success(await vehicleRepository.create({ ...body, customerId: params.id }));
  }, { body: t.Object({ plate: t.String(), make: t.Optional(t.String()), model: t.Optional(t.String()), year: t.Optional(t.String()), color: t.Optional(t.String()) }) })
  .get("/:id/veiculos", async ({ headers, params }) => {
    requireAuth(await extractUser(headers));
    return success(await vehicleRepository.listByCustomer(params.id));
  });
