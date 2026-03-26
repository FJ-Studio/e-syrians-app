import { NextResponse } from "next/server";
import { withApiRoute } from "@/lib/api-route";

export const POST = withApiRoute(
  async ({ req, body, session }) => {
    const request = await fetch(`${process.env.API_URL}/users/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Language": req.headers.get("accept-language") ?? "en",
        Authorization: `Bearer ${session!.user.accessToken}`,
        "User-Agent": req.headers.get("user-agent") ?? "",
      },
      body: JSON.stringify(body),
    });
    const response = await request.json();
    return NextResponse.json(response, { status: request.status });
  },
  { requireAuth: true, requireRecaptcha: true }
);
