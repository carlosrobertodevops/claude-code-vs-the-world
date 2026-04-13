import { LogoutButton } from "@/components/ui/logout-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { UserRole } from "@/types/domain";

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
      {role === "MANAGER" ? "Gerente" : "Colaborador"}
    </span>
  );
}

export function Topbar({
  name,
  role,
}: {
  name: string;
  role: UserRole;
}) {
  return (
    <header className="surface-strong flex flex-col gap-4 rounded-[32px] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <p className="muted-label text-[11px] text-slate-500">Painel de comando</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="section-title text-2xl font-semibold text-white">{name}</h1>
          <RoleBadge role={role} />
        </div>
        <p className="mt-2 text-sm text-slate-400">
          Fluxo de atendimento, fila publica e indicadores em uma so camada.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
