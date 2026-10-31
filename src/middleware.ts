import createIntlMiddleware from "next-intl/middleware";

import { Session } from "next-auth";
import { NextRequest } from "next/server";
import { auth } from "../auth";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const AUTH_API = "/api/auth";
const PROTECTED = "/account";
const AUTH_PAGE = "/auth";
const DELETION_PENDING_SUFFIX = "/account/deletion-pending";

export default auth((req: NextRequest & { auth: Session | null }): Response | void => {
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
    return Response.redirect(new URL(`/auth/sign-in?redirect=${encodeURI(nextUrl.toString())}`, nextUrl));
  }

  // Global pending-deletion invariant. The dashboard layout used to be
  // the only enforcement point, which meant a pending user reading a
  // public poll or landing page could stay off the deletion-pending
  // screen indefinitely. Middleware-level enforcement catches every
  // route (including public ones) the moment the session flips.
  //
  // Notes:
  //   - Value comes from the JWT, so it's only as fresh as the last
  //     session write. That's fine for "trap the user" purposes:
  //     - request-deletion writes the timestamp via updateSession()
  //     - cancel-deletion / hard-delete on another device eventually
  //       reconcile via the SWR poll on the deletion-pending screen.
  //   - Whitelist below matches the API-side EnsureAccountNotPending
  //     Deletion middleware: the pending user needs to stay able to
  //     read the deletion-pending screen and sign out.
  if (isLoggedIn && req.auth?.user?.deletion_scheduled_for) {
    const isOnDeletionPending = nextUrl.pathname.endsWith(DELETION_PENDING_SUFFIX);
    const isSignOutFlow = nextUrl.pathname.includes("/api/auth/signout");
    if (!isOnDeletionPending && !isSignOutFlow) {
      return Response.redirect(new URL(DELETION_PENDING_SUFFIX, nextUrl));
    }
  }

  return intlMiddleware(req);
});

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
