import type { Metadata } from "next";
import { IBM_Plex_Mono, Sora } from "next/font/google";

import { Providers } from "@/components/shared/providers";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_TAGLINE,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${sora.variable} ${ibmMono.variable}`} lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
