export const APP_NAME = "AquaFlow";

export const ROLES = {
  MANAGER: "MANAGER",
  EMPLOYEE: "EMPLOYEE",
} as const;

export const SERVICE_ORDER_STATUS_LABELS: Record<string, string> = {
  WAITING: "Aguardando",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluido",
  CANCELLED: "Cancelado",
};

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  SENT: "Enviado",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  EXPIRED: "Expirado",
};

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  PENDING_SIGNATURE: "Aguardando Assinatura",
  SIGNED: "Assinado",
  CANCELLED: "Cancelado",
};

export const STOCK_MOVEMENT_LABELS: Record<string, string> = {
  IN: "Entrada",
  OUT: "Saida",
  ADJUSTMENT: "Ajuste",
};

export const ROLE_LABELS: Record<string, string> = {
  MANAGER: "Gerente",
  EMPLOYEE: "Funcionario",
};

export const ITEMS_PER_PAGE = 10;
