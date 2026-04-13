import { Elysia } from "elysia";

import { listCustomersUseCase } from "@/server/domain/use-cases/list-operations-data.use-case";
import { operationsRepository } from "@/server/infrastructure/repositories/demo-operations.repository";

export const customersRoutes = new Elysia({ prefix: "/clientes" }).get(
  "/",
  async () => ({
    success: true,
    data: await listCustomersUseCase(operationsRepository),
  }),
);
