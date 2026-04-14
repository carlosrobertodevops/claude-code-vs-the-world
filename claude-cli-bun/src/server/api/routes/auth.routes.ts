import { Elysia, t } from "elysia";
import { extractUser, requireAuth } from "../plugins/auth";
import { userRepository } from "@/server/infrastructure/repositories";
import { verifyPassword } from "@/server/infrastructure/auth/password";
import { signJwt } from "@/server/infrastructure/auth/jwt";
import { UnauthorizedError } from "@/lib/errors";
import { success } from "@/lib/utils/response";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post("/login", async ({ body }) => {
    const user = await userRepository.findByEmail(body.email);
    if (!user) throw new UnauthorizedError("Invalid credentials");
    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) throw new UnauthorizedError("Invalid credentials");
    const token = await signJwt({ id: user.id, email: user.email, role: user.role });
    return success({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  }, { body: t.Object({ email: t.String(), password: t.String() }) })
  .get("/me", async ({ headers }) => {
    const user = await extractUser(headers);
    return success(requireAuth(user));
  });
