import { Elysia } from "elysia";

import { requireRole } from "@/server/api/plugins/auth";
import { operationsRepository } from "@/server/infrastructure/repositories/demo-operations.repository";

export const configRoutes = new Elysia({ prefix: "/configuracoes" }).get(
  "/",
  async ({ request }) => {
    requireRole(
      request.headers.get("x-user-role") as "MANAGER" | "EMPLOYEE" | null,
      ["MANAGER"],
    );

    return {
      success: true,
      data: await operationsRepository.getConfig(),
    };
  },
);
