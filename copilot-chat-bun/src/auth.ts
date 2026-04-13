import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import { users } from "@/lib/demo-data";

const credentialsSchema = z.object({
  email: z.email("Email invalido"),
  password: z.string().min(8, "Senha invalida"),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = users.find((entry) => entry.email === parsed.data.email);
        if (!user) {
          return null;
        }

        const matches = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );

        if (!matches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as "MANAGER" | "EMPLOYEE") ?? "EMPLOYEE";
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
