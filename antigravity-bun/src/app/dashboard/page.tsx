import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Droplets, LogOut } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  // Proteção da rota
  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
      <header className="px-8 py-6 border-b border-zinc-800/50 flex justify-between items-center glassmorphism sticky top-0 z-50 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Droplets className="text-white h-5 w-5" />
          </div>
          <h1 className="text-xl font-heading font-extrabold tracking-tight">LavaFlow</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-sm text-zinc-400">
            Olá, <span className="font-semibold text-zinc-200">{(session.user as any)?.name}</span>
          </div>
          <form action={async () => {
             "use server"
             const { signOut } = await import("@/auth");
             await signOut({ redirectTo: "/" });
          }}>
            <button className="text-zinc-400 hover:text-white transition-colors flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sair</span>
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 p-8 sm:p-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-2">Ordens de Serviço</h3>
            <p className="text-4xl font-bold text-blue-400">12</p>
            <p className="text-sm text-zinc-500 mt-2">Ativas hoje</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-2">Faturamento</h3>
            <p className="text-4xl font-bold text-emerald-400">R$ 1.250</p>
            <p className="text-sm text-zinc-500 mt-2">Hoje</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-2">Fila Pública</h3>
            <p className="text-4xl font-bold text-purple-400">5</p>
            <p className="text-sm text-zinc-500 mt-2">Veículos no pátio</p>
          </div>
        </div>
        
        <div className="mt-12 bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 min-h-[400px] flex items-center justify-center border-dashed">
          <p className="text-zinc-500 italic">Módulos Phase 3+ virão aqui (Estoque, Clientes, etc.)</p>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .glassmorphism {
          background: rgba(24, 24, 27, 0.4);
        }
      `}} />
    </div>
  );
}
