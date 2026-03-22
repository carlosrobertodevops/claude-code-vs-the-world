import Link from "next/link";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { APP_NAME, navItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Sidebar({ pathname, role }: { pathname: string; role: "MANAGER" | "EMPLOYEE" }) {
  const items = navItems.filter((item) => !item.managerOnly || role === "MANAGER");

  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-white/50 bg-white/70 px-6 py-8 backdrop-blur xl:flex">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--primary)]">micro-saas</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{APP_NAME}</h1>
        <p className="mt-2 text-sm text-slate-600">Rotina, fila e caixa do lava-jato em um unico lugar.</p>
      </div>

      <nav className="mt-10 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active ? "bg-slate-950 text-white shadow-lg" : "text-slate-700 hover:bg-white",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <ThemeToggle />
      </div>
    </aside>
  );
}
