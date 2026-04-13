"use client";

import { Droplets, ArrowRight, Truck } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Credenciais inválidas. Tente admin@aquaflow.com / password123');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-center relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      <main className="relative z-10 mx-auto w-full max-w-md p-8 sm:p-12 glassmorphism rounded-3xl border border-zinc-800/50 shadow-2xl backdrop-blur-xl">
        <div className="mb-10 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] transform transition-transform duration-500 hover:scale-105 hover:rotate-3">
            <Droplets className="text-white h-8 w-8" />
          </div>
          <h1 className="text-4xl font-heading font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-500">
            LavaFlow
          </h1>
          <p className="text-zinc-400 text-sm font-medium">
            O painel de controle do seu Lava-Jato.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg p-3 text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-zinc-300 ml-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aquaflow.com"
              required
              className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-100 text-sm rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label htmlFor="password" className="text-sm font-semibold text-zinc-300">
                Senha
              </label>
              <Link href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                Esqueceu a senha?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-100 text-sm rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl px-4 py-3.5 flex items-center justify-center space-x-2 transition-all duration-300 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? 'Acessando...' : 'Acessar Painel'}</span>
            {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-zinc-800/50 text-center">
          <p className="text-xs text-zinc-500 flex items-center justify-center space-x-2">
            <Truck className="w-4 h-4" />
            <span>Sistema restrito a funcionários.</span>
          </p>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .glassmorphism {
          background: rgba(24, 24, 27, 0.4);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
      `}} />
    </div>
  );
}
