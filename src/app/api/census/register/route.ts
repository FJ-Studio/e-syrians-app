// import recaptchaIsValid from "@/lib/recaptcha";
import recaptchaIsValid from "@/lib/recaptcha";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const isHuman = await recaptchaIsValid(
      body.get("recaptcha_token") as string
    );
    if (!isHuman) {
      return NextResponse.json(
        {
          messages: ["Invalid recaptcha token"],
        },
        { status: 400 }
      );
    }
    const request = await fetch(`${process.env.API_URL}/users/register`, {
      method: "POST",
      headers: {
        accept: "application/json",
      },
      body,
    });
    const response = await request.json();
    return NextResponse.json(response, { status: request.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
