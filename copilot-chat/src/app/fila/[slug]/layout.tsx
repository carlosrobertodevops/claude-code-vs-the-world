import "@/app/globals.css";
import { Providers } from "@/components/providers";

export const metadata = { title: "Fila de Atendimento" };

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
