import { Elysia } from "elysia";

import { configRoutes } from "@/server/api/routes/config.routes";
import { contractsRoutes } from "@/server/api/routes/contracts.routes";
import { customersRoutes } from "@/server/api/routes/customers.routes";
import { employeesRoutes } from "@/server/api/routes/employees.routes";
import { inventoryRoutes } from "@/server/api/routes/inventory.routes";
import { queueRoutes } from "@/server/api/routes/queue.routes";
import { quotesRoutes } from "@/server/api/routes/quotes.routes";
import { reportsRoutes } from "@/server/api/routes/reports.routes";
import { servicesRoutes } from "@/server/api/routes/services.routes";
import { uploadRoutes } from "@/server/api/routes/upload.routes";

export const apiApp = new Elysia({ prefix: "/api" })
  .derive(({ request }) => ({
    auth: {
      role: request.headers.get("x-user-role") as "MANAGER" | "EMPLOYEE" | null,
      userId: request.headers.get("x-user-id"),
    },
  }))
  .onError(({ code, error, set }) => {
    const message = error instanceof Error ? error.message : String(error);

    if (code === "NOT_FOUND" || message === "PUBLIC_QUEUE_NOT_FOUND") {
      set.status = 404;
    } else if (message === "FORBIDDEN") {
      set.status = 403;
    } else {
      set.status = 400;
    }

    return {
      success: false,
      error: {
        code: message === "FORBIDDEN" ? "FORBIDDEN" : code,
        message,
      },
    };
  })
  .get("/health", () => ({
    success: true,
    data: { ok: true },
  }))
  .use(inventoryRoutes)
  .use(customersRoutes)
  .use(servicesRoutes)
  .use(quotesRoutes)
  .use(contractsRoutes)
  .use(queueRoutes)
  .use(employeesRoutes)
  .use(reportsRoutes)
  .use(uploadRoutes)
  .use(configRoutes);
