import recaptchaIsValid from "@/lib/recaptcha";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const isHuman = await recaptchaIsValid(body.recaptcha_token);
    if (!isHuman) {
        return NextResponse.json({ success: false, messages: ["invalid_recaptcha_token"] }, { status: 400 });
    }
    const session = await auth();
    if (!session) {
        return NextResponse.json({ success: false, messages: ["unauthorized"] }, { status: 401 });
    }
    const request = await fetch(`${process.env.API_URL}/users/change-notifications`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${session?.user.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    return NextResponse.json(await request.json(), { status: request.status });
}