import type { Elysia } from "elysia";

import type { UserRole } from "@/types/domain";

export function withAuthContext(app: Elysia) {
  return app.derive(({ request }) => {
    const role = request.headers.get("x-user-role") as UserRole | null;
    const userId = request.headers.get("x-user-id");

    return {
      auth: {
        role,
        userId,
      },
    };
  });
}

export function requireRole(
  currentRole: UserRole | null,
  allowedRoles: UserRole[],
) {
  if (!currentRole || !allowedRoles.includes(currentRole)) {
    throw new Error("FORBIDDEN");
  }
}
