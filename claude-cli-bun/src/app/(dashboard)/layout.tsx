"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/dashboard", label: "Início" },
  { href: "/dashboard/clientes", label: "Clientes" },
  { href: "/dashboard/inventario/produtos", label: "Produtos" },
  { href: "/dashboard/inventario/servicos", label: "Serviços" },
  { href: "/dashboard/servicos", label: "Ordens" },
  { href: "/dashboard/fila", label: "Fila" },
  { href: "/dashboard/orcamentos", label: "Orçamentos" },
  { href: "/dashboard/contratos", label: "Contratos" },
  { href: "/dashboard/relatorios", label: "Relatórios" },
  { href: "/dashboard/funcionarios", label: "Funcionários" },
  { href: "/dashboard/configuracoes", label: "Configurações" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const logout = () => { clearToken(); router.push("/login"); };
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-muted/30 p-4">
        <h2 className="mb-4 text-lg font-semibold">LavaFlow</h2>
        <nav className="flex flex-col gap-1 text-sm">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded px-2 py-1 hover:bg-muted">{n.label}</Link>
          ))}
        </nav>
        <Button variant="outline" size="sm" className="mt-6 w-full" onClick={logout}>Sair</Button>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
