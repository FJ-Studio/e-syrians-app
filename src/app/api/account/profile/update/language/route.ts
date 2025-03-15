import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const request = await fetch(
      `${process.env.API_URL}/users/update/language`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );
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
