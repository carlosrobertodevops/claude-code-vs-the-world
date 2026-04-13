import { Elysia } from "elysia";
import { z } from "zod";

import { requireRole } from "@/server/api/plugins/auth";
import { signContractUseCase } from "@/server/domain/use-cases/sign-contract.use-case";
import { listContractsUseCase } from "@/server/domain/use-cases/list-operations-data.use-case";
import { operationsRepository } from "@/server/infrastructure/repositories/demo-operations.repository";

const contractIdSchema = z.object({ id: z.string().min(1) });

export const contractsRoutes = new Elysia({ prefix: "/contratos" })
  .get("/", async ({ request }) => {
    requireRole(
      request.headers.get("x-user-role") as "MANAGER" | "EMPLOYEE" | null,
      ["MANAGER"],
    );

    return {
      success: true,
      data: await listContractsUseCase(operationsRepository),
    };
  })
  .post("/:id/assinar", async ({ params }) => {
    const parsed = contractIdSchema.parse(params);

    return {
      success: true,
      data: await signContractUseCase(parsed.id),
    };
  });
