import { withApiRoute } from "@/lib/api-route";
import { NextResponse } from "next/server";

export const PATCH = withApiRoute(
  async ({ body, session }) => {
    const request = await fetch(`${process.env.API_URL}/polls/status/${body.pollId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session!.user.accessToken}`,
      },
      body: JSON.stringify({ status: body.status }),
    });
    const data = await request.json();
    return NextResponse.json(data, { status: request.status });
  },
  { requireAuth: true, requireRecaptcha: true },
);
