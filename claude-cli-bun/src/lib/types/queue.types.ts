import type { QueueStatus } from "./common.types";

export interface QueueEntry {
  id: string;
  serviceOrderId: string;
  slug: string;
  position: number;
  status: QueueStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicQueueEntry {
  position: number;
  vehicle: { plate: string; model?: string | null };
  status: QueueStatus;
}

export interface AddToQueueInput {
  serviceOrderId: string;
  slug: string;
}

export interface MoveQueueInput {
  entryId: string;
  newPosition: number;
}
