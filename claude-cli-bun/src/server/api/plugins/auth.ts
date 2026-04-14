import { verifyJwt } from "@/server/infrastructure/auth/jwt";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import type { Role } from "@/lib/types/common.types";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export async function extractUser(headers: Record<string, string | undefined>): Promise<AuthUser | null> {
  const authHeader = headers.authorization ?? headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const payload = await verifyJwt<AuthUser & Record<string, unknown>>(token);
    return { id: payload.id, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export const requireAuth = (user: AuthUser | null): AuthUser => {
  if (!user) throw new UnauthorizedError();
  return user;
};

export const requireManager = (user: AuthUser | null): AuthUser => {
  const u = requireAuth(user);
  if (u.role !== "MANAGER") throw new ForbiddenError("Manager role required");
  return u;
};
