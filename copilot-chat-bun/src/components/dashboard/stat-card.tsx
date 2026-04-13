import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
}) {
  return (
    <article className="surface-card rounded-[28px] p-5 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <div className="rounded-[20px] border border-emerald-300/16 bg-emerald-400/10 p-3 text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          {icon}
        </div>
      </div>
      <p className="section-title mt-7 text-[2rem] font-semibold text-white">{value}</p>
      <p className="mt-2 max-w-[18rem] text-sm leading-6 text-slate-400">{helper}</p>
    </article>
  );
}
