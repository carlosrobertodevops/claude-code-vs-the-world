import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Car,
  ClipboardList,
  Package,
  FileText,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Clientes", href: "/clientes" },
  { icon: Car, label: "Veículos", href: "/veiculos" },
  { icon: ClipboardList, label: "Ordens de Serviço", href: "/servicos" },
  { icon: Package, label: "Inventário", href: "/inventario" },
  { icon: FileText, label: "Relatórios", href: "/relatorios" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
];

export function Sidebar() {
  const { data: session } = useSession();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-white border-r h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-blue-600 tracking-tight">BrilhoSaaS</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
            {session?.user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{session?.user?.name || 'Usuário'}</p>
            <p className="text-xs text-slate-500 truncate">{session?.user?.role || 'Sessão'}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => signOut()} className="h-8 w-8">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
