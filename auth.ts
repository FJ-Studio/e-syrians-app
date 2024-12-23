import { DOMAIN_URL } from "@/lib/constants";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          throw new Error("Missing credentials.");
        }
        let user = null;

        try {
          const response = await fetch(`${DOMAIN_URL}/api/auth/login`, {
            method: "POST",
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to login");
          }

          user = await response.json();
          return user;
        } catch(e) {
            console.log("ERROR: ", e);
        }
        return user;
      },
    }),
    Google
  ],
});
