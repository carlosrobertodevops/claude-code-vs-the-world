import { Elysia } from "elysia";

import { requireRole } from "@/server/api/plugins/auth";
import { exportReportCsvUseCase } from "@/server/domain/use-cases/export-report-csv.use-case";
import { getDashboardSummaryUseCase } from "@/server/domain/use-cases/get-dashboard-summary.use-case";
import { operationsRepository } from "@/server/infrastructure/repositories/demo-operations.repository";

export const reportsRoutes = new Elysia({ prefix: "/relatorios" })
  .get("/resumo", async ({ request }) => {
    requireRole(
      request.headers.get("x-user-role") as "MANAGER" | "EMPLOYEE" | null,
      ["MANAGER"],
    );

    return {
      success: true,
      data: await getDashboardSummaryUseCase(operationsRepository),
    };
  })
  .get("/csv", async ({ request, set }) => {
    requireRole(
      request.headers.get("x-user-role") as "MANAGER" | "EMPLOYEE" | null,
      ["MANAGER"],
    );
    set.headers["content-type"] = "text/csv; charset=utf-8";

    return await exportReportCsvUseCase(operationsRepository);
  });
