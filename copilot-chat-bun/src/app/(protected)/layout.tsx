import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen px-4 py-4 lg:px-6 lg:py-5">
      <div className="mx-auto grid max-w-[1500px] gap-5 lg:grid-cols-[18.5rem_1fr]">
        <Sidebar role={session.user.role} />
        <div className="space-y-5">
          <Topbar
            name={session.user.name ?? "Equipe LavaFlow"}
            role={session.user.role}
          />
          <main className="space-y-5">{children}</main>
        </div>
      </div>
    </div>
  );
}
