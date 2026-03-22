import { Card } from "@/components/ui/card";

export function StatCard({ eyebrow, value, helper }: { eyebrow: string; value: string; helper: string }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--primary),#f59e0b)]" />
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{eyebrow}</p>
      <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{helper}</p>
    </Card>
  );
}
