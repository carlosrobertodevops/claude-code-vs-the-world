import type { OperationsRepository } from "@/server/domain/repositories/operations.repository";

export async function getDashboardSummaryUseCase(
  repository: OperationsRepository,
) {
  return repository.getDashboardSummary();
}
