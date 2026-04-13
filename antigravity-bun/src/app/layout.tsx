import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// A fonte Inter, o padrão ouro profissional para leitura em interfaces limpas
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LavaFlow | Painel de Controle',
  description: 'Sistema completo para gestão de Lava-jatos',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} antialiased h-full`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
