import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if (user.id) token.id = user.id;
        if ((user as { role?: string }).role) token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const publicPaths = ["/login", "/fila", "/api/auth", "/api/fila/publica", "/api/contratos"];
      if (publicPaths.some((p) => pathname.startsWith(p))) return true;
      if (pathname.startsWith("/_next") || pathname.startsWith("/uploads") || pathname === "/favicon.ico") return true;

      if (!isLoggedIn) return false; // Redirect to login

      const managerOnlyPaths = ["/funcionarios", "/contratos", "/relatorios", "/configuracoes"];
      if (managerOnlyPaths.some((p) => pathname.startsWith(p)) && auth?.user?.role !== "MANAGER") {
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Added in auth.ts
  session: { strategy: "jwt" },
};
