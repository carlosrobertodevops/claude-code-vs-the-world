"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email("Informe um email valido."),
  password: z.string().min(8, "Senha obrigatoria."),
});

type LoginInput = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@lavaflow.com",
      password: "password123",
    },
  });

  async function onSubmit(values: LoginInput) {
    setLoading(true);

    const response = await signIn("credentials", {
      ...values,
      callbackUrl,
      redirect: false,
    });

    setLoading(false);

    if (!response?.ok) {
      toast.error("Nao foi possivel entrar.");
      return;
    }

    toast.success("Login realizado.");
    router.push(response.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="surface-strong space-y-5 rounded-[32px] p-8 shadow-2xl shadow-black/30"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="muted-label text-[11px] text-slate-500">Acesso seguro</p>
          <p className="mt-2 text-sm text-slate-400">
            Entre com a conta demo ou com a credencial da operacao.
          </p>
        </div>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
          Auth
        </span>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
        <input
          {...form.register("email")}
          placeholder="admin@lavaflow.com"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/40 focus:bg-white/[0.08]"
        />
        {form.formState.errors.email ? (
          <p className="mt-2 text-xs text-rose-300">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">Senha</label>
        <input
          type="password"
          {...form.register("password")}
          placeholder="password123"
          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/40 focus:bg-white/[0.08]"
        />
        {form.formState.errors.password ? (
          <p className="mt-2 text-xs text-rose-300">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>
      <button
        disabled={loading}
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Entrar na operacao
      </button>
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-xs text-slate-400">
        Demo pronta: <span className="font-medium text-slate-200">admin@lavaflow.com</span> /{" "}
        <span className="font-medium text-slate-200">password123</span>
      </div>
    </form>
  );
}
