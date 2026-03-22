import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      // authorize is implemented in auth.ts (full version with Prisma)
      authorize: () => null,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Public paths
      const publicPaths = ["/login", "/fila"];
      if (publicPaths.some((p) => pathname.startsWith(p))) return true;

      // Public contract signing
      if (pathname.match(/^\/contratos\/[^/]+\/assinar/)) return true;

      // Public API routes
      if (pathname.startsWith("/api/fila/publica")) return true;
      if (pathname.startsWith("/api/contratos") && pathname.includes("/assinar")) return true;
      if (pathname.startsWith("/api/auth")) return true;

      if (!isLoggedIn) return false;

      // Manager-only routes
      const managerOnlyPaths = ["/funcionarios", "/contratos", "/relatorios", "/configuracoes"];
      const managerOnlyApiPaths = ["/api/funcionarios", "/api/contratos", "/api/relatorios", "/api/configuracoes"];
      const isManagerRoute = managerOnlyPaths.some((p) => pathname.startsWith(p));
      const isManagerApi = managerOnlyApiPaths.some((p) => pathname.startsWith(p));

      if ((isManagerRoute || isManagerApi) && auth?.user?.role !== "MANAGER") {
        return false;
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
