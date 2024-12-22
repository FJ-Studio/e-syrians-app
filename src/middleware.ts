import createIntlMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";
import { NextRequest } from "next/server";
import { Session } from "next-auth";
import { auth } from "../auth";

const intlMiddleware = createIntlMiddleware(routing);

const AUTH_API = "/api/auth";
const PROTECTED = "/account";
const AUTH_PAGE = "/auth";

export default auth(
  (req: NextRequest & { auth: Session | null }): Response | void => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const isApiAuthRoute = nextUrl.pathname.includes(AUTH_API);
    const isAuthPage = nextUrl.pathname.includes(AUTH_PAGE);
    const isProtectedRoute = nextUrl.pathname.includes(PROTECTED);
    if (isApiAuthRoute) {
      return intlMiddleware(req);
    }
    if (isAuthPage && isLoggedIn) {
      return Response.redirect(new URL(PROTECTED, nextUrl));
    }
    if (isProtectedRoute && !isLoggedIn) {
      return Response.redirect(
        new URL(
          `/auth/signin?redirect=${encodeURI(nextUrl.toString())}`,
          nextUrl
        )
      );
    }
    return intlMiddleware(req);
  }
);

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
