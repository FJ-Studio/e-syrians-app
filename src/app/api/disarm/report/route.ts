import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";

export async function POST(request: NextRequest) {
    const reqJson = await request.json();
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const res = await axios.post(`${process.env.API_URL}/disarm/report`, reqJson, {
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        if (res.status === 200) {
            return NextResponse.json({ success: res.data });
        }
        return NextResponse.json({ error: res.data }, { status: res.status });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
    
}
