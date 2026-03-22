import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireManagerPage() {
  const session = await requireSession();
  if (session.user.role !== UserRole.MANAGER) {
    redirect("/dashboard");
  }
  return session;
}

export function requireRole(role: UserRole, actualRole: UserRole) {
  if (role === UserRole.MANAGER && actualRole !== UserRole.MANAGER) {
    throw new Error("FORBIDDEN");
  }
}
