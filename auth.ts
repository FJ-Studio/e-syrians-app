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

      // Avoid repeated API calls by checking if esUser exists and is still valid
      if (token.esUser && (token.esUser as ESUser).accessToken) {
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
            token.esUser = { ...data.user, accessToken: data.data.token };
          } else {
            console.error(data);
            return null;
          }
        }
      } catch (error) {
        console.error("JWT callback error:", error);
      }

      return token;
    },
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
});
