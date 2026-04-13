import type { OperationsRepository } from "@/server/domain/repositories/operations.repository";

export async function getPublicQueueUseCase(
  repository: OperationsRepository,
  slug: string,
) {
  return repository.getPublicQueueBySlug(slug);
}
