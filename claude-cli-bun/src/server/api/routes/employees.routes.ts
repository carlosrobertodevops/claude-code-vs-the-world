import { Elysia, t } from "elysia";
import { extractUser, requireManager } from "../plugins/auth";
import { userRepository } from "@/server/infrastructure/repositories";
import { hashPassword } from "@/server/infrastructure/auth/password";
import { NotFoundError } from "@/lib/errors";
import { success } from "@/lib/utils/response";

export const employeeRoutes = new Elysia({ prefix: "/funcionarios" })
  .get("/", async ({ headers, query }) => {
    requireManager(await extractUser(headers));
    const result = await userRepository.list({ page: Number(query.page ?? 1), limit: Number(query.limit ?? 20) });
    return success(result.data, result.meta);
  })
  .post("/", async ({ headers, body }) => {
    requireManager(await extractUser(headers));
    const passwordHash = await hashPassword(body.password);
    const created = await userRepository.create({ ...body, passwordHash });
    return success(created);
  }, { body: t.Object({ name: t.String(), email: t.String(), password: t.String(), role: t.Union([t.Literal("MANAGER"), t.Literal("EMPLOYEE")]) }) })
  .patch("/:id", async ({ headers, params, body }) => {
    requireManager(await extractUser(headers));
    return success(await userRepository.update(params.id, body));
  }, { body: t.Object({ name: t.Optional(t.String()), email: t.Optional(t.String()), role: t.Optional(t.Union([t.Literal("MANAGER"), t.Literal("EMPLOYEE")])) }) })
  .delete("/:id", async ({ headers, params }) => {
    requireManager(await extractUser(headers));
    const found = await userRepository.findById(params.id);
    if (!found) throw new NotFoundError("User", params.id);
    await userRepository.softDelete(params.id);
    return success({ id: params.id });
  });
