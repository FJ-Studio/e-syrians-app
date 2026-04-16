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

const MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Credentials({
      type: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        challenge_token: { label: "Challenge Token", type: "text" },
        twofa_code: { label: "2FA Code", type: "text" },
        is_recovery_code: { label: "Is Recovery Code", type: "text" },
      },
      authorize: async (credentials): Promise<ESUser | null> => {
        // Handle 2FA verification (second step of login)
        if (credentials?.challenge_token && credentials?.twofa_code) {
          let req: Response;
          try {
            req = await fetch(`${process.env.API_URL}/users/2fa/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                challenge_token: credentials.challenge_token,
                code: credentials.twofa_code,
                is_recovery_code: credentials.is_recovery_code === "true",
              }),
            });
          } catch {
            throw new Error("Unable to reach authentication server.");
          }

          if (!req.ok) {
            throw new Error("INVALID_2FA_CODE");
          }

          const data = await req.json();
          if (data?.data?.token) {
            return { ...data.data.user, accessToken: data.data.token };
          }
          return null;
        }

        // Normal credentials login (first step)
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials.");
        }

        let req: Response;
        try {
          req = await fetch(`${process.env.API_URL}/users/login`, {
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
        } catch {
          throw new Error("Unable to reach authentication server.");
        }

        if (!req.ok) {
          return null;
        }

        const data = await req.json();

        // If 2FA is required, throw a special error with the challenge token
        if (data?.data?.requires_2fa) {
          throw new Error(`2FA_REQUIRED:${data.data.challenge_token}:${data.data.expires_at}`);
        }

        if (data?.data?.token) {
          return { ...data.data.user, accessToken: data.data.token };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/sign-in",
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
    async jwt({ account, token, user, trigger, session: updateData }) {
      // Handle session update from client (e.g. after verification status changes)
      if (trigger === "update" && updateData && token.esUser) {
        token.esUser = { ...(token.esUser as ESUser), ...updateData };
        return token;
      }

      const providers = ["google"];

      // Check if token has expired (7-day maxAge)
      if (token.esUser && (token.esUser as ESUser).accessToken) {
        const tokenIssuedAt = (token.iat as number) ?? 0;
        const now = Math.floor(Date.now() / 1000);
        if (now - tokenIssuedAt > MAX_AGE) {
          // Token expired — clear session to force re-login
          return { ...token, esUser: undefined };
        }
        return token;
      }

      try {
        if (account?.provider && providers.includes(account.provider)) {
          // Social login request
          const response = await fetch(`${process.env.API_URL}/users/login/social`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              provider: account.provider,
              token: account.access_token,
            }),
          });

          if (!response.ok) {
            // Social login failed — force re-authentication
            return { ...token, esUser: undefined };
          }

          const data = await response.json();
          if (data?.data?.token) {
            token.esUser = {
              ...data.data.user,
              accessToken: data.data.token,
            };
          } else {
            return { ...token, esUser: undefined };
          }
        } else if (account?.provider === "credentials" && user) {
          // Local login request
          token.esUser = user;
        }
      } catch {
        // Network or parsing error — clear session to force re-login
        return { ...token, esUser: undefined };
      }

      return token;
    },
  },
  jwt: {
    maxAge: MAX_AGE,
  },
});
