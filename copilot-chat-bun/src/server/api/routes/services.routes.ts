import { Elysia } from "elysia";

import {
  listServiceOrdersUseCase,
  listServiceTypesUseCase,
} from "@/server/domain/use-cases/list-operations-data.use-case";
import { operationsRepository } from "@/server/infrastructure/repositories/demo-operations.repository";

export const servicesRoutes = new Elysia({ prefix: "/servicos" })
  .get("/", async () => ({
    success: true,
    data: await listServiceOrdersUseCase(operationsRepository),
  }))
  .get("/tipos", async () => ({
    success: true,
    data: await listServiceTypesUseCase(operationsRepository),
  }));
