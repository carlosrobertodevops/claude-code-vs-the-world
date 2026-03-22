import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function formatCpfCnpj(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  if (cleaned.length === 14) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  }
  return value;
}

export function maskPlate(plate: string): string {
  if (plate.length >= 5) {
    return `${plate.slice(0, 3)}-**${plate.slice(-2)}`;
  }
  return plate;
}

export function generateWhatsAppLink(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const fullPhone = cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
  const url = `https://wa.me/${fullPhone}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function generateOrderNumber(prefix: string, count: number): string {
  return `${prefix}-${String(count).padStart(4, "0")}`;
}

export type ApiResponse<T> = {
  success: true;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} | {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function successResponse<T>(data: T, meta?: ApiResponse<T> extends { success: true } ? ApiResponse<T>["meta"] : never) {
  return Response.json({ success: true, data, meta });
}

export function errorResponse(code: string, message: string, status = 400, details?: unknown) {
  return Response.json(
    { success: false, error: { code, message, details } },
    { status }
  );
}

export function csvExport(headers: string[], rows: string[][]): string {
  const headerLine = headers.join(",");
  const dataLines = rows.map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
  );
  return [headerLine, ...dataLines].join("\n");
}
