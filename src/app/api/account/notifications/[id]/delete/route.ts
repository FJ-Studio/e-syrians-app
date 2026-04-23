import { withAuthGet } from "@/lib/api-route";
import { NextResponse } from "next/server";

export const DELETE = withAuthGet(async ({ session, routeParams }) => {
  const id = routeParams?.id as string;
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
