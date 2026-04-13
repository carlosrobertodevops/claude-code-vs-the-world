import type { Session } from "next-auth";
import { redirect } from "next/navigation";

export function requireManager(session: Session | null) {
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "MANAGER") {
    redirect("/dashboard");
  }
}
