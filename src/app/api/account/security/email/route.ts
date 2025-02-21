import recaptchaIsValid from "@/lib/recaptcha";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const isHuman = await recaptchaIsValid(body.recaptcha_token);
  if ( !isHuman) {
    return NextResponse.json({ success: false, messages: ["recaptcha.invalid"] }, { status: 400 });
  }
  const session = await auth();
  if (!session) {
    return NextResponse.json({ success: false, messages: ["auth.unauthenticated"] }, { status: 401 });
  }
  const request = await fetch(`${process.env.API_URL}/users/change-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${session?.user.accessToken}`
    },
    body: JSON.stringify(body)
  });
  const response = await request.json();
  return NextResponse.json(response, { status: request.status });
}