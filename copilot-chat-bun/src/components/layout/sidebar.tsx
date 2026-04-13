"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/domain";

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();

  return (
    <aside className="surface-strong flex w-full flex-col rounded-[32px] p-4 lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:w-[18.5rem]">
      <div className="surface-soft mb-6 rounded-[28px] p-5">
        <div className="mb-8 flex items-center justify-between">
          <p className="muted-label text-[11px] text-emerald-300/80">
            LavaFlow
          </p>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium text-emerald-200">
            online
          </span>
        </div>
        <p className="text-sm text-slate-400">Cockpit operacional</p>
        <h2 className="section-title mt-2 text-[1.7rem] font-semibold leading-tight text-white">
          LavaFlow
          <span className="block text-slate-300">Operacao, fila e caixa em sintonia.</span>
        </h2>
      </div>
      <nav className="flex-1 space-y-2">
        {navigationItems
          .filter((item) => !item.managerOnly || role === "MANAGER")
          .map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition duration-200",
                  active
                    ? "bg-emerald-400/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    : "text-slate-300 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-2xl border",
                    active
                      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                      : "border-white/[0.08] bg-white/[0.05] text-slate-400",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
      </nav>
      <div className="mt-6 rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4">
        <p className="muted-label text-[10px] text-slate-500">Acesso</p>
        <p className="mt-2 text-sm font-medium text-white">
          {role === "MANAGER" ? "Gerencia completa" : "Operacao assistida"}
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Interface desenhada para toque rapido e leitura limpa no patio.
        </p>
      </div>
    </aside>
  );
}
