import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import recaptchaIsValid from "@/lib/recaptcha";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const isHuman = await recaptchaIsValid(body.recaptcha_token);
    if (!isHuman) {
        return NextResponse.json({ error: "Invalid recaptcha token" }, { status: 400 });
    }
    const request = await fetch(`${process.env.API_URL}/users/change-password`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${session.user.accessToken}`,
            "Content-Type": "application/json",
            "Accept": "application/json",   
        },
        body: JSON.stringify({
            current_password: body.currentPassword,
            new_password: body.newPassword,
            new_password_confirmation: body.confirmPassword,
        }),
    });
    const response = await request.json();
    return NextResponse.json(response, { status: request.status });
}