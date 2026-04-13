import { Elysia } from "elysia";

import { listQuotesUseCase } from "@/server/domain/use-cases/list-operations-data.use-case";
import { operationsRepository } from "@/server/infrastructure/repositories/demo-operations.repository";

export const quotesRoutes = new Elysia({ prefix: "/orcamentos" }).get(
  "/",
  async () => ({
    success: true,
    data: await listQuotesUseCase(operationsRepository),
  }),
);
