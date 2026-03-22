"use client";

import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { STATUS_LABELS } from "@/lib/constants";

export function Header() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <SidebarTrigger />
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Alternar tema</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-full" />}>
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <div className="flex items-center gap-2 p-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
              <p className="text-xs text-muted-foreground">
                {STATUS_LABELS[session?.user?.role || ""] || session?.user?.role}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
