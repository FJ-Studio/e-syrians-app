import recaptchaIsValid from "@/lib/recaptcha";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await req.formData();
        if (!recaptchaIsValid(body.get("recaptcha_token") as string)) {
            return NextResponse.json({ success: false, messages: ["Invalid recaptcha token"] }, { status: 400 });
        }
        const request = await fetch(`${process.env.API_URL}/users/update/avatar`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Accept-Language": req.headers.get("Accept-Language") as string,
                "Authorization": `Bearer ${session?.user.accessToken}`,
            },
            body,
        });
        const response = await request.json();
        return NextResponse.json(response, { status: request.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, messages: ["Failed to update avatar"] }, { status: 500 });
    }
}