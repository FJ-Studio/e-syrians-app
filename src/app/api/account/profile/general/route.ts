import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";

export async function GET() {
  const session = await auth();
  if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  try {
    const request = await fetch(`${process.env.API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });
    const data = await request.json();
    return NextResponse.json(data, { status: data.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, messages: ["genericError"] },
      { status: 500 }
    );
  }
}
