import { headers } from "next/headers";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { requireSession } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "/dashboard";

  return (
    <div className="min-h-screen xl:flex">
      <Sidebar pathname={pathname} role={session.user.role} />
      <div className="flex-1 px-4 py-4 sm:px-6 xl:px-8 xl:py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <Header name={session.user.name ?? "Equipe"} role={session.user.role} />
          {children}
        </div>
      </div>
    </div>
  );
}
