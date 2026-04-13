"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Droplets, Eye, EyeOff, Loader2 } from "lucide-react";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou senha incorretos");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4 animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] shadow-xl shadow-[hsl(var(--primary)/0.3)] mb-4">
          <Droplets className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] bg-clip-text text-transparent">
          {APP_NAME}
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          {APP_DESCRIPTION}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8 shadow-xl shadow-black/5 dark:shadow-black/20">
        <h2 className="text-xl font-semibold mb-6">Entrar na sua conta</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 pr-10 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] text-white font-medium text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-[hsl(var(--primary)/0.3)] hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.4)]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Entrando...
              </span>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[hsl(var(--border))]">
          <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
            Credenciais de demo: <span className="font-medium">admin@aquawash.com</span> / <span className="font-medium">password123</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md px-4" />}>
      <LoginPageContent />
    </Suspense>
  );
}
