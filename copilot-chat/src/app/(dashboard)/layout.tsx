"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Droplets,
  Package,
  FileText,
  FileSignature,
  Wrench,
  Users,
  UserCog,
  BarChart3,
  Settings,
  ListOrdered,
  LogOut,
  Moon,
  Sun,
  Menu,
  Car,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["MANAGER", "EMPLOYEE"] },
  { name: "Servicos", href: "/servicos", icon: Wrench, roles: ["MANAGER", "EMPLOYEE"] },
  { name: "Fila", href: "/fila", icon: ListOrdered, roles: ["MANAGER", "EMPLOYEE"] },
  { name: "Clientes", href: "/clientes", icon: Users, roles: ["MANAGER", "EMPLOYEE"] },
  { name: "Inventario", href: "/inventario", icon: Package, roles: ["MANAGER", "EMPLOYEE"] },
  { name: "Orcamentos", href: "/orcamentos", icon: FileText, roles: ["MANAGER", "EMPLOYEE"] },
  { name: "Contratos", href: "/contratos", icon: FileSignature, roles: ["MANAGER"] },
  { name: "Funcionarios", href: "/funcionarios", icon: UserCog, roles: ["MANAGER"] },
  { name: "Relatorios", href: "/relatorios", icon: BarChart3, roles: ["MANAGER"] },
  { name: "Configuracoes", href: "/configuracoes", icon: Settings, roles: ["MANAGER"] },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const userRole = session?.user?.role || "EMPLOYEE";

  const filteredNav = navigation.filter((item) => item.roles.includes(userRole));

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 px-4 border-b">
        <Droplets className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">AquaFlow</span>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="border-t p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p className="font-medium">{session?.user?.name}</p>
            <p className="text-muted-foreground text-xs">{session?.user?.role === "MANAGER" ? "Gerente" : "Funcionario"}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-card">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="flex flex-1 flex-col">
          <header className="md:hidden flex h-16 items-center gap-4 border-b px-4 bg-card">
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-primary" />
              <span className="font-bold">AquaFlow</span>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/30">
            {children}
          </main>
        </div>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
