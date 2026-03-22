import { BarChart3, CarFront, ClipboardList, FileSignature, Gauge, Package2, Settings, Users, UsersRound, Waves } from "lucide-react";

export const APP_NAME = "JatoFlow";
export const APP_TAGLINE = "Operacao inteligente para lava-jatos que querem crescer sem perder o controle.";

export type NavItem = {
  href: string;
  label: string;
  icon: typeof Gauge;
  managerOnly?: boolean;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/servicos", label: "Servicos", icon: CarFront },
  { href: "/fila", label: "Fila", icon: Waves },
  { href: "/inventario", label: "Inventario", icon: Package2 },
  { href: "/orcamentos", label: "Orcamentos", icon: ClipboardList },
  { href: "/contratos", label: "Contratos", icon: FileSignature },
  { href: "/funcionarios", label: "Funcionarios", icon: UsersRound, managerOnly: true },
  { href: "/relatorios", label: "Relatorios", icon: BarChart3, managerOnly: true },
  { href: "/configuracoes", label: "Configuracoes", icon: Settings, managerOnly: true },
];

export const uploadMimeTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export const statusLabels = {
  DRAFT: "Rascunho",
  SENT: "Enviado",
  APPROVED: "Aprovado",
  REJECTED: "Recusado",
  EXPIRED: "Expirado",
  PENDING_SIGNATURE: "Aguardando assinatura",
  SIGNED: "Assinado",
  CANCELLED: "Cancelado",
  WAITING: "Aguardando",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluido",
  MANAGER: "Gerente",
  EMPLOYEE: "Funcionario",
  IN: "Entrada",
  OUT: "Saida",
  ADJUSTMENT: "Ajuste",
} as const;
