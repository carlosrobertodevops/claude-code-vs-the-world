export const APP_NAME = "AquaWash";

export const ROLES = {
  MANAGER: "MANAGER",
  EMPLOYEE: "EMPLOYEE",
} as const;

export const SERVICE_ORDER_STATUS = {
  WAITING: "WAITING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export const QUOTE_STATUS = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
} as const;

export const CONTRACT_STATUS = {
  DRAFT: "DRAFT",
  PENDING_SIGNATURE: "PENDING_SIGNATURE",
  SIGNED: "SIGNED",
  CANCELLED: "CANCELLED",
} as const;

export const STOCK_MOVEMENT_TYPE = {
  IN: "IN",
  OUT: "OUT",
  ADJUSTMENT: "ADJUSTMENT",
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const QUEUE_REFRESH_INTERVAL = 30000; // 30 seconds

export const STATUS_LABELS: Record<string, string> = {
  WAITING: "Aguardando",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  DRAFT: "Rascunho",
  SENT: "Enviado",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  EXPIRED: "Expirado",
  PENDING_SIGNATURE: "Aguardando Assinatura",
  SIGNED: "Assinado",
  IN: "Entrada",
  OUT: "Saída",
  ADJUSTMENT: "Ajuste",
  MANAGER: "Gerente",
  EMPLOYEE: "Funcionário",
};
