import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ClipboardList,
  FileSignature,
  LayoutDashboard,
  Package,
  Settings,
  Users,
  Waves,
  Wrench,
} from "lucide-react";

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
  managerOnly?: boolean;
}

export const navigationItems: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventario", label: "Inventario", icon: Package },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/servicos", label: "Ordens de servico", icon: Wrench },
  { href: "/orcamentos", label: "Orcamentos", icon: ClipboardList },
  { href: "/contratos", label: "Contratos", icon: FileSignature, managerOnly: true },
  { href: "/fila", label: "Fila publica", icon: Waves },
  { href: "/relatorios", label: "Relatorios", icon: BarChart3, managerOnly: true },
  { href: "/equipe", label: "Equipe", icon: Users, managerOnly: true },
  { href: "/configuracoes", label: "Configuracoes", icon: Settings, managerOnly: true },
];
