import type { AddToQueueInput, MoveQueueInput, PublicQueueEntry, QueueEntry } from "@/lib/types/queue.types";

export interface IQueueRepository {
  listBySlug(slug: string): Promise<QueueEntry[]>;
  addEntry(input: AddToQueueInput): Promise<QueueEntry>;
  move(input: MoveQueueInput): Promise<QueueEntry>;
  remove(entryId: string): Promise<void>;
  getPublic(slug: string): Promise<PublicQueueEntry[]>;
}
