import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // MOCK AUTH: Validar credenciais padrão até que o schema do DB esteja pronto.
        if (
          credentials?.email === "admin@aquaflow.com" &&
          credentials?.password === "password123"
        ) {
          return { id: "1", name: "Admin", email: "admin@aquaflow.com", role: "MANAGER" };
        }
        return null;
      }
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  }
});
