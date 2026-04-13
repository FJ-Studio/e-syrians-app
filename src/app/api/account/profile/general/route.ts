import { withAuthGet } from "@/lib/api-route";
import { NextResponse } from "next/server";

export const GET = withAuthGet(async ({ session }) => {
  const request = await fetch(`${process.env.API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  });
  const data = await request.json();
  return NextResponse.json(data, { status: request.status });
}, "genericError");
