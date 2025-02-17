import recaptchaIsValid from "@/lib/recaptcha";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const page = req.nextUrl.searchParams.get("page");
    try {
        const request = await fetch(`${process.env.API_URL}/users/my-polls?page=${page}`, {
            headers: {
                accept: "application/json",
                authorization: `Bearer ${session?.user.accessToken}`,
            },
        });
        const response = await request.json();
        return NextResponse.json(response, { status: request.status });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await auth()
    try {
        const body = await req.formData();
        const recaptcha = await recaptchaIsValid(body.get("recaptcha_token") as string);
        if (!recaptcha) {
            return NextResponse.json({ success: false, message: "Invalid recaptcha" }, { status: 400 });
        }
        const request = await fetch(`${process.env.API_URL}/polls`, {
            method: "POST",
            headers: {
                accept: "application/json",
                authorization: `Bearer ${session?.user.accessToken}`,
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