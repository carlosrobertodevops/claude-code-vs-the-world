"use client";

import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/constants";

const statusColors: Record<string, string> = {
  WAITING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  SENT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  EXPIRED: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  PENDING_SIGNATURE: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  SIGNED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={statusColors[status] || ""}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}
