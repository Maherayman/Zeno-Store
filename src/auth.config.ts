import type { NextAuthConfig } from "next-auth";

const authConfig = {
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as "CUSTOMER" | "ADMIN" | "MANAGER";
      }
      return session;
    }
  },
  pages: { signIn: "/login" }
} satisfies NextAuthConfig;

export default authConfig;
