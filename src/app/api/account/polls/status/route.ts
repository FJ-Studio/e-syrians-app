import recaptchaIsValid from "@/lib/recaptcha";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const isHuman = await recaptchaIsValid(body.recaptcha_token);
  if (!isHuman) {
    return NextResponse.json(
      { messages: ["invalid_recaptcha_token"], success: false },
      { status: 400 }
    );
  }
  const session = await auth();
  if (!session) {
    return NextResponse.json({ messages: ["Unauthorized"] }, { status: 401 });
  }
  const request = await fetch(
    `${process.env.API_URL}/polls/status/${body.pollId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
      body: JSON.stringify({ status: body.status }),
    }
  );
  const data = await request.json();
  return NextResponse.json(data, { status: data.status });
}
