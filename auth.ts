import { ESUser } from "@/lib/types/account";
import NextAuth from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: AdapterUser & ESUser;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Credentials({
      type: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials): Promise<ESUser | null> => {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials.");
        }
        const req = await fetch(`${process.env.API_URL}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            identifier: credentials.email,
            password: credentials.password,
          }),
        });
        const data = await req.json();
        if (data?.data?.token) {
          return { ...data.data.user, accessToken: data.data.token };
        } else {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },

  callbacks: {
    async session({ session, token }) {
      if (token.esUser) {
        session.user = token.esUser as AdapterUser & ESUser;
      } else {
        // Token expired or missing — invalidate session
        session.user = undefined as unknown as AdapterUser & ESUser;
      }
      return session;
    },
    async jwt({ account, token, user }) {
      const providers = ["google"];

      // Check if token has expired (7-day maxAge)
      if (token.esUser && (token.esUser as ESUser).accessToken) {
        const tokenIssuedAt = (token.iat as number) ?? 0;
        const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
        const now = Math.floor(Date.now() / 1000);
        if (now - tokenIssuedAt > maxAge) {
          // Token expired — clear session to force re-login
          return { ...token, esUser: undefined };
        }
        return token;
      }

      try {
        if (account?.provider && providers.includes(account.provider)) {
          // Social login request
          const response = await fetch(
            `${process.env.API_URL}/users/login/social`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                provider: account.provider,
                token: account.access_token,
              }),
            }
          );

          const data = await response.json();
          if (data?.data?.token) {
            token.esUser = { ...data.data.user, accessToken: data.data.token };
          } else {
            return null;
          }
        } else if (account?.provider === "credentials" && user) {
          // Local login request
          token.esUser = user;
        }
      } catch (error) {
        console.error("JWT callback error:", error);
      }

      return token;
    },
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },
});
