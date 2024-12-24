import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const reqJson = await request.json();
    const headersList = await headers();
    try {
        const res = await axios.post(`${process.env.API_URL}/weapons-delivery`, reqJson, {
            headers: {
                Authorization: headersList.get('authorization'),
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
