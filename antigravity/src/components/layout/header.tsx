"use client";

import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, LogOut, User } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.8)] backdrop-blur-md">
      {/* Left side */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] lg:hidden transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:block" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
          title={theme === "dark" ? "Modo claro" : "Modo escuro"}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          )}
        </button>

        {/* User menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] flex items-center justify-center text-white text-xs font-semibold">
              {session?.user?.name ? getInitials(session.user.name) : <User className="w-4 h-4" />}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-tight">{session?.user?.name || "Usuário"}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {ROLE_LABELS[session?.user?.role || ""] || ""}
              </p>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 py-1 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-lg animate-fade-in">
              <div className="px-4 py-2 border-b border-[hsl(var(--border))]">
                <p className="text-sm font-medium">{session?.user?.name}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{session?.user?.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-[hsl(var(--muted))] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
