import { UserRole } from "@prisma/client";
import { LogOut } from "lucide-react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";

export function Header({ name, role }: { name: string; role: UserRole }) {
  return (
    <header className="flex flex-col gap-4 rounded-[28px] border border-white/50 bg-white/80 p-5 shadow-[0_14px_50px_rgba(15,23,42,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm text-slate-500">Bem-vindo de volta</p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{name}</h2>
        <p className="text-sm text-slate-600">Perfil ativo: {role === UserRole.MANAGER ? "Gerente" : "Funcionario"}</p>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <Button variant="secondary" type="submit">
            <LogOut className="mr-2 size-4" />
            Sair
          </Button>
        </form>
      </div>
    </header>
  );
}
