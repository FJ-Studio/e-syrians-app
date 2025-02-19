import recaptchaIsValid from "@/lib/recaptcha";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();
  const isHuman = await recaptchaIsValid(body.recaptcha_token);
  if (!isHuman) {
    return NextResponse.json(
      {
        messages: ["Invalid recaptcha token"],
      },
      { status: 400 }
    );
  }
  const request = await fetch(`${process.env.API_URL}/polls/react`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: `Bearer ${session?.user.accessToken}`,
    },
    body,
  });
  const response = await request.json();
  return NextResponse.json(response, { status: request.status });
}
