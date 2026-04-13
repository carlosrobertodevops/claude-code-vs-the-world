import { Elysia } from "elysia";
import { z } from "zod";

import { getPublicQueueUseCase } from "@/server/domain/use-cases/get-public-queue.use-case";
import { listQueueUseCase } from "@/server/domain/use-cases/list-operations-data.use-case";
import { operationsRepository } from "@/server/infrastructure/repositories/demo-operations.repository";

const slugSchema = z.object({ slug: z.string().min(1) });

export const queueRoutes = new Elysia({ prefix: "/fila" })
  .get("/", async () => ({
    success: true,
    data: await listQueueUseCase(operationsRepository),
  }))
  .get("/publica/:slug", async ({ params }) => {
    const parsed = slugSchema.parse(params);

    return {
      success: true,
      data: await getPublicQueueUseCase(operationsRepository, parsed.slug),
    };
  });
