import { Elysia, t } from "elysia";
import { extractUser, requireManager } from "../plugins/auth";
import { contractRepository } from "@/server/infrastructure/repositories";
import { success } from "@/lib/utils/response";

export const contractRoutes = new Elysia({ prefix: "/contratos" })
  .get("/", async ({ headers, query }) => {
    requireManager(await extractUser(headers));
    const r = await contractRepository.list({ page: Number(query.page ?? 1), limit: Number(query.limit ?? 20) });
    return success(r.data, r.meta);
  })
  .post("/", async ({ headers, body }) => {
    requireManager(await extractUser(headers));
    return success(await contractRepository.create(body));
  }, { body: t.Object({ customerId: t.String(), quoteId: t.Optional(t.String()), body: t.String() }) })
  .post("/:id/assinar", async ({ params, body }) => {
    return success(await contractRepository.signWithToken({ contractId: params.id, token: body.token }));
  }, { body: t.Object({ token: t.String() }) });
