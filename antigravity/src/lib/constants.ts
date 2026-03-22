export const APP_NAME = "AquaWash";
export const APP_DESCRIPTION = "Sistema de Gestão para Lava-Jatos";

export const ROLES = {
  MANAGER: "MANAGER" as const,
  EMPLOYEE: "EMPLOYEE" as const,
};

export const ROLE_LABELS: Record<string, string> = {
  MANAGER: "Gerente",
  EMPLOYEE: "Funcionário",
};

export const SERVICE_ORDER_STATUS_LABELS: Record<string, string> = {
  WAITING: "Aguardando",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

export const SERVICE_ORDER_STATUS_COLORS: Record<string, string> = {
  WAITING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  SENT: "Enviado",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  EXPIRED: "Expirado",
};

export const QUOTE_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  SENT: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  EXPIRED: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

export const CONTRACT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  PENDING_SIGNATURE: "Aguardando Assinatura",
  SIGNED: "Assinado",
  CANCELLED: "Cancelado",
};

export const CONTRACT_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  PENDING_SIGNATURE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  SIGNED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export const STOCK_MOVEMENT_LABELS: Record<string, string> = {
  IN: "Entrada",
  OUT: "Saída",
  ADJUSTMENT: "Ajuste",
};

export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ITEMS_PER_PAGE = 10;
export const QUEUE_REFRESH_INTERVAL = 30000; // 30 seconds
