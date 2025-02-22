import recaptchaIsValid from "@/lib/recaptcha";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const isHuman = await recaptchaIsValid(body.recaptcha_token);
    if (!isHuman) {
        return NextResponse.json({ messages: ["invalid_recaptcha_token"], success: false }, { status: 400 });
    }
    const request = await fetch(`${process.env.API_URL}/users/forgot-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({
            email : body.email,
        }),
    });
    const response = await request.json();
    return NextResponse.json(response, { status: request.status });
}