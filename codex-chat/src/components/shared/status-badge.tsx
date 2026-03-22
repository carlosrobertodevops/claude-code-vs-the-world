import { statusLabels } from "@/lib/constants";
import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  WAITING: "bg-amber-50 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-sky-50 text-sky-700 border-sky-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  SENT: "bg-sky-50 text-sky-700 border-sky-200",
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  EXPIRED: "bg-orange-50 text-orange-700 border-orange-200",
  SIGNED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING_SIGNATURE: "bg-violet-50 text-violet-700 border-violet-200",
  MANAGER: "bg-indigo-50 text-indigo-700 border-indigo-200",
  EMPLOYEE: "bg-slate-100 text-slate-700 border-slate-200",
  IN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  OUT: "bg-rose-50 text-rose-700 border-rose-200",
  ADJUSTMENT: "bg-amber-50 text-amber-700 border-amber-200",
};

export function StatusBadge({ status }: { status: keyof typeof statusLabels | string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        colorMap[status] ?? "bg-slate-100 text-slate-700 border-slate-200",
      )}
    >
      {statusLabels[status as keyof typeof statusLabels] ?? status}
    </span>
  );
}
