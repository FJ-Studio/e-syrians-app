import { withAuthGet } from "@/lib/api-route";
import { NextResponse } from "next/server";

export const DELETE = withAuthGet(async ({ req, session }) => {
  const id = req.nextUrl.pathname.split("/").slice(-2, -1)[0];
  const request = await fetch(`${process.env.API_URL}/users/notifications/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${session.user.accessToken}`,
    },
  });
  const response = await request.json();
  return NextResponse.json(response, { status: request.status });
});
