export async function moveQueueUseCase(
  queueEntryId: string,
  nextStatus: "QUEUED" | "WASHING" | "READY" | "DELIVERED",
) {
  return {
    queueEntryId,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };
}
