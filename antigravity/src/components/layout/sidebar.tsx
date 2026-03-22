"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import {
  LayoutDashboard,
  Package,
  FileText,
  FileCheck,
  Wrench,
  Users,
  UserCog,
  BarChart3,
  Settings,
  ListOrdered,
  Droplets,
  X,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["MANAGER", "EMPLOYEE"] },
  { name: "Ordens de Serviço", href: "/servicos", icon: Wrench, roles: ["MANAGER", "EMPLOYEE"] },
  { name: "Fila", href: "/fila", icon: ListOrdered, roles: ["MANAGER", "EMPLOYEE"] },
  { name: "Clientes", href: "/clientes", icon: Users, roles: ["MANAGER", "EMPLOYEE"] },
  { name: "Inventário", href: "/inventario", icon: Package, roles: ["MANAGER", "EMPLOYEE"] },
  { name: "Orçamentos", href: "/orcamentos", icon: FileText, roles: ["MANAGER", "EMPLOYEE"] },
  { name: "Contratos", href: "/contratos", icon: FileCheck, roles: ["MANAGER"] },
  { name: "Funcionários", href: "/funcionarios", icon: UserCog, roles: ["MANAGER"] },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3, roles: ["MANAGER"] },
  { name: "Configurações", href: "/configuracoes", icon: Settings, roles: ["MANAGER"] },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role || "EMPLOYEE";

  const filteredNav = navigation.filter((item) => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          "bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-[hsl(var(--sidebar-border))]">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Droplets className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] bg-clip-text text-transparent">
              {APP_NAME}
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-md lg:hidden hover:bg-[hsl(var(--muted))]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[hsl(var(--primary))] text-white shadow-md shadow-[hsl(var(--primary)/0.3)]"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-white")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[hsl(var(--sidebar-border))]">
          <div className="text-xs text-[hsl(var(--muted-foreground))] text-center">
            {APP_NAME} © {new Date().getFullYear()}
          </div>
        </div>
      </aside>
    </>
  );
}
