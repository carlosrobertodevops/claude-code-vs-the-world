import { Sparkles } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions } from "@/auth";
import { LoginForm } from "@/components/forms/login-form";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-[1500px] gap-6 px-4 py-4 lg:grid-cols-[1.08fr_0.92fr] lg:px-6 lg:py-5">
      <section className="surface-strong flex flex-col justify-between rounded-[36px] p-8 text-white lg:p-10">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100">
            <Sparkles className="h-4 w-4" />
            Micro-SaaS para lava-jatos
          </span>
          <p className="muted-label mt-10 text-[11px] text-slate-500">Operacao conectada</p>
          <h1 className="section-title mt-3 max-w-2xl text-5xl font-semibold leading-[1.02] sm:text-[3.7rem]">
            Gestao completa com cara de central operacional premium.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Estoque, clientes, ordens de servico, contratos e visao executiva em
            um painel responsivo com dark mode e fila publica para o balcao.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Dark mode", "Leitura limpa para turnos noturnos e brilho controlado."],
            ["CSV operacional", "Saida rapida para contabilidade e conferencias."],
            ["QR da fila", "Cliente acompanha sem depender do caixa."],
          ].map(([title, description]) => (
            <div
              key={title}
              className="surface-soft rounded-[28px] p-4"
            >
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="flex flex-col justify-center">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6">
            <p className="muted-label text-[11px] text-slate-500">LavaFlow</p>
            <h2 className="section-title mt-3 text-3xl font-semibold text-white">
              Entre para iniciar o turno
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Acesse o cockpit para acompanhar a esteira completa do atendimento.
            </p>
          </div>
          <LoginForm />
          <p className="mt-6 text-sm text-slate-400">
            Acompanhar fila publica?{" "}
            <Link href="/fila/lavaflow-centro" className="text-emerald-300">
              Abrir painel do cliente
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
