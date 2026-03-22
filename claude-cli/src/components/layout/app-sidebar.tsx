"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  FileText,
  FileSignature,
  Wrench,
  Users,
  UserCog,
  BarChart3,
  Settings,
  ListOrdered,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { APP_NAME } from "@/lib/constants";

const mainNav = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Clientes", href: "/clientes", icon: Users },
  { title: "Ordens de Serviço", href: "/servicos", icon: Wrench },
  { title: "Fila", href: "/fila", icon: ListOrdered },
  { title: "Orçamentos", href: "/orcamentos", icon: FileText },
  { title: "Inventário", href: "/inventario", icon: Package },
];

const managerNav = [
  { title: "Funcionários", href: "/funcionarios", icon: UserCog },
  { title: "Contratos", href: "/contratos", icon: FileSignature },
  { title: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { title: "Configurações", href: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isManager = session?.user?.role === "MANAGER";

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            AW
          </div>
          <span className="font-bold text-lg">{APP_NAME}</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href + item.title}>
                  <SidebarMenuButton
                    isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isManager && (
          <SidebarGroup>
            <SidebarGroupLabel>Gerência</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {managerNav.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={pathname.startsWith(item.href)}
                      render={<Link href={item.href} />}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
