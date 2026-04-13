import { Elysia } from "elysia";

import { requireRole } from "@/server/api/plugins/auth";
import { listEmployeesUseCase } from "@/server/domain/use-cases/list-operations-data.use-case";
import { operationsRepository } from "@/server/infrastructure/repositories/demo-operations.repository";

export const employeesRoutes = new Elysia({ prefix: "/funcionarios" }).get(
  "/",
  async ({ request }) => {
    requireRole(
      request.headers.get("x-user-role") as "MANAGER" | "EMPLOYEE" | null,
      ["MANAGER"],
    );

    return {
      success: true,
      data: await listEmployeesUseCase(operationsRepository),
    };
  },
);
