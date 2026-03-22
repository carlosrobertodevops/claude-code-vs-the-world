import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "AquaWash - Sistema de Gestão para Lava-Jatos",
  description: "Plataforma completa para gestão de lava-jatos. Controle de estoque, orçamentos, contratos, ordens de serviço, fila de atendimento e relatórios.",
  keywords: ["lava-jato", "gestão", "SaaS", "ordem de serviço", "controle de estoque"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
