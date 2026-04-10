import { withApiRoute } from "@/lib/api-route";
import { NextResponse } from "next/server";

/**
 * Public endpoint — verifies 2FA challenge during login.
 * No auth required (user isn't logged in yet).
 */
export const POST = withApiRoute(
  async ({ body }) => {
    const request = await fetch(
      `${process.env.API_URL}/users/2fa/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    const response = await request.json();
    return NextResponse.json(response, { status: request.status });
  },
  { requireAuth: false, requireRecaptcha: false, errorMessage: "2FA verification failed" },
);
