import recaptchaIsValid from "@/lib/recaptcha";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.formData();
  if (!recaptchaIsValid(body.get("recaptcha_token") as string)) {
    return NextResponse.json(
      {
        messages: ["Invalid recaptcha token"],
      },
      { status: 400 }
    );
  }
  try {
    const request = await fetch(`${process.env.API_URL}/users/update/census`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session?.user.accessToken}`,
      },
      body: (body),
    });
    const response = await request.json();
    return NextResponse.json(response, { status: request.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        messages: ["An error occurred"],
      },
      { status: 500 }
    );
  }
}
