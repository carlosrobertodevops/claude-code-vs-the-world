import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string) {
  const numericValue = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isNaN(numericValue) ? 0 : numericValue);
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value));
}

export function maskPlate(plate: string) {
  if (plate.length < 4) return plate;
  return `${plate.slice(0, 3)}-**${plate.slice(-2)}`;
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseDecimal(value: FormDataEntryValue | null, fallback = 0) {
  if (typeof value !== "string") return fallback;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseInteger(value: FormDataEntryValue | null, fallback = 0) {
  if (typeof value !== "string") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>) {
  return Response.json({ success: true, data, meta });
}

export function apiError(code: string, message: string, details?: unknown, status = 400) {
  return Response.json(
    {
      success: false,
      error: { code, message, details },
    },
    { status },
  );
}
