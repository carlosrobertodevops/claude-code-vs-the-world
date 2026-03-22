import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export function success<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function error(message: string, status: number = 400, code?: string) {
  return NextResponse.json(
    { success: false, error: { code: code || "ERROR", message } },
    { status }
  );
}

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new AuthError("Nao autenticado", 401);
  }
  return session;
}

export async function requireRole(role: string) {
  const session = await requireAuth();
  if (session.user.role !== role) {
    throw new AuthError("Sem permissao", 403);
  }
  return session;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function handleApiError(err: unknown) {
  if (err instanceof AuthError) {
    return error(err.message, err.status);
  }
  console.error(err);
  return error("Erro interno do servidor", 500);
}
