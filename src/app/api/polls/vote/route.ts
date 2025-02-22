import recaptchaIsValid from "@/lib/recaptcha";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user.accessToken) {
    return NextResponse.json(
      {
        messages: ["Unauthorized"],
      },
      { status: 401 }
    )
  }
  const request = await fetch(`${process.env.API_URL}/users/my-votes?page=${req.nextUrl.searchParams.get('page')}`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${session?.user.accessToken}`,
    },
  });
  const response = await request.json();
  return NextResponse.json(response, { status: request.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const isHuman = await recaptchaIsValid(body.recaptcha_token);
  if (!isHuman) {
    return NextResponse.json(
      { messages: ["invalid_recaptcha_token"], success: false },
      { status: 400 }
    );
  }
  const session = await auth();
  if (!session?.user.accessToken) {
    return NextResponse.json(
      {
        messages: ["Unauthorized"],
      },
      { status: 401 }
    )
  }
  const request = await fetch(`${process.env.API_URL}/polls/vote`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: `Bearer ${session?.user.accessToken}`,
    },
    body: JSON.stringify(body),
  });
  const response = await request.json();
  return NextResponse.json(response, { status: request.status });
}
