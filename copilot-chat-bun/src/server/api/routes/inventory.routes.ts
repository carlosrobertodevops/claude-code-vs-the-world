import { Elysia } from "elysia";

import { listInventoryUseCase } from "@/server/domain/use-cases/list-operations-data.use-case";
import { operationsRepository } from "@/server/infrastructure/repositories/demo-operations.repository";

export const inventoryRoutes = new Elysia({ prefix: "/inventario" }).get(
  "/",
  async () => ({
    success: true,
    data: await listInventoryUseCase(operationsRepository),
  }),
);
