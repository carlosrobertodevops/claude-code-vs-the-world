"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="surface-soft inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-slate-200 transition hover:bg-white/5"
    >
      <LogOut className="h-4 w-4" />
      Sair
    </button>
  );
}
