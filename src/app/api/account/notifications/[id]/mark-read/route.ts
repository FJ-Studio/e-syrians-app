import { withAuthGet } from "@/lib/api-route";
import { NextResponse } from "next/server";

export const POST = withAuthGet(async ({ session, routeParams }) => {
  const id = routeParams?.id as string;
  const request = await fetch(`${process.env.API_URL}/users/notifications/${id}/mark-read`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${session.user.accessToken}`,
    },
    body: JSON.stringify({}),
  });
  const response = await request.json();
  return NextResponse.json(response, { status: request.status });
});
