import type { OperationsRepository } from "@/server/domain/repositories/operations.repository";

export async function exportReportCsvUseCase(repository: OperationsRepository) {
  const rows = await repository.exportReportRows();
  const csvLines = ["servico,quantidade", ...rows.map((row) => `${row.label},${row.value}`)];

  return csvLines.join("\n");
}
