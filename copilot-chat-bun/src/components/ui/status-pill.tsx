import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  WAITING: "bg-amber-400/15 text-amber-200",
  IN_PROGRESS: "bg-cyan-400/15 text-cyan-200",
  DONE: "bg-emerald-400/15 text-emerald-200",
  DELIVERED: "bg-slate-400/15 text-slate-200",
  DRAFT: "bg-slate-400/15 text-slate-200",
  SENT: "bg-cyan-400/15 text-cyan-200",
  APPROVED: "bg-emerald-400/15 text-emerald-200",
  PENDING: "bg-amber-400/15 text-amber-200",
  SIGNED: "bg-emerald-400/15 text-emerald-200",
  QUEUED: "bg-slate-400/15 text-slate-200",
  WASHING: "bg-cyan-400/15 text-cyan-200",
  READY: "bg-emerald-400/15 text-emerald-200",
};

export function StatusPill({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium",
        variants[value] ?? "bg-white/10 text-white",
      )}
    >
      {value}
    </span>
  );
}
