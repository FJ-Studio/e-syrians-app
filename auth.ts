import { ESUser } from "@/lib/types";
import NextAuth from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: AdapterUser & ESUser;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.fhUser) {
        session.user = token.fhUser as AdapterUser & ESUser;
      }
      return session;
    },
    async jwt({ account, token }) {
      const providers = ["google"];
      if (typeof token?.esUser === "object") {
        const esUser = token.esUser as ESUser;
        // request to /me
        const response = await fetch(
          `${process.env.API_URL}/users/me`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${esUser.accessToken}`,
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          token.esUser = { ...data.data, accessToken: esUser.accessToken };
        } else {
          token.esUser = null;
        }
      } else if (
        (account?.provider && providers.includes(account?.provider)) ||
        (token?.provider && providers.includes(token?.provider as string))
      ) {
        // request to /login/social
        const response = await fetch(
          `${process.env.API_URL}/users/login/social`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              provider: account?.provider ?? token?.provider,
              token: account?.access_token,
            }),
          }
        );
        const data = await response.json();
        if (data.success) {
          token.esUser = { ...data.data, accessToken: data.token };
        }
      }
      if (account?.provider === "google") {
        token.accessToken = account.accessToken;
        token.id = account.id;
      }
      return token;
    },
  },
});
