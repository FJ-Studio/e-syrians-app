import { ESUser } from "@/lib/types/account";
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
      if (token.esUser) {
        session.user = token.esUser as AdapterUser & ESUser;
      }
      return session;
    },
    async jwt({ account, token }) {
      const providers = ["google"];
      if (typeof token?.esUser === "object") {
        const esUser = token.esUser as ESUser;
        // request to /me
        try {
          const response = await fetch(`${process.env.API_URL}/users/me`, {
            method: "GET",
            headers: {
              "Accept": "application/json",
              Authorization: `Bearer ${esUser?.accessToken}`,
            },
          });
          const data = await response.json();
          if (data?.data?.id) {
            token.esUser = { ...data.data, accessToken: esUser?.accessToken };
          } else {
            token.esUser = null;
          }
        } catch (error) {
          console.error(error);
        }
      } else if (
        (account?.provider && providers.includes(account?.provider)) ||
        (token?.provider && providers.includes(token?.provider as string))
      ) {
        // request to /login/social
        try {
          const response = await fetch(
            `${process.env.API_URL}/users/login/social`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
              },
              body: JSON.stringify({
                provider: account?.provider ?? token?.provider,
                token: account?.access_token,
              }),
            }
          );
          const data = await response.json();
          if (data?.data?.token) {
            token.esUser = { ...data.user, accessToken: data.token };
          } else {
            console.error(data);
            return null;
          }
        } catch (error) {
          console.error(error);
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
