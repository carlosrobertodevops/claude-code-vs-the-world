"use client";

import { useForm } from "react-hook-form";
import { LogIn, Sparkles } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginFormValues>({
    defaultValues: {
      email: "admin@jatoflow.com",
      password: "password123",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Credenciais invalidas.");
      return;
    }

    toast.success("Login realizado com sucesso.");
    router.push("/dashboard");
    router.refresh();
  });

  return (
    <main className="grid min-h-screen gap-8 px-6 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
      <section className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(140deg,#0b132b,#1d4ed8_52%,#38bdf8)] p-8 text-white shadow-[0_30px_120px_rgba(15,23,42,0.28)] lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.32),transparent_24%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between gap-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-100">Micro-SaaS para lava-jatos</p>
            <h1 className="mt-4 max-w-xl text-5xl font-semibold tracking-tight">{APP_NAME}</h1>
            <p className="mt-4 max-w-xl text-lg text-sky-50/85">{APP_TAGLINE}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-white/15 bg-white/10 text-white shadow-none">
              <p className="text-sm text-sky-100">Fila publica automatica</p>
              <p className="mt-2 text-2xl font-semibold">Tempo estimado em tempo real</p>
            </Card>
            <Card className="border-white/15 bg-white/10 text-white shadow-none">
              <p className="text-sm text-sky-100">Programa de fidelidade</p>
              <p className="mt-2 text-2xl font-semibold">Clientes voltam com mais frequencia</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center">
        <Card className="w-full max-w-xl p-8">
          <div className="flex items-center gap-3 text-[var(--primary)]">
            <Sparkles className="size-5" />
            <span className="text-sm font-semibold uppercase tracking-[0.28em]">Acesso ao painel</span>
          </div>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">Entrar no JatoFlow</h2>
          <p className="mt-2 text-sm text-slate-600">Use o usuario seed ou crie novos colaboradores no painel de funcionarios.</p>

          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">Email</label>
              <Input id="email" type="email" {...register("email")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="password">Senha</label>
              <Input id="password" type="password" {...register("password")} />
            </div>
            <Button className="w-full" disabled={isSubmitting} type="submit">
              <LogIn className="mr-2 size-4" />
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
            <p><strong>Seed:</strong> admin@jatoflow.com / password123</p>
            <p><strong>Equipe:</strong> joao@jatoflow.com e maria@jatoflow.com / password123</p>
          </div>
        </Card>
      </section>
    </main>
  );
}
