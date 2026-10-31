import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";

/**
 * POST /api/account/audiences/[uuid]/resolve — re-run entry resolution
 * against the current user set. Heavy on the DB (touches every entry),
 * so the backend rate-limits it to 5/min.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  try {
    const session = await auth();
    if (!session?.user.accessToken) {
      return NextResponse.json({ success: false, messages: ["Unauthorized"] }, { status: 401 });
    }

    const { uuid } = await params;
    const body = await req.json().catch(() => ({}));

    const backend = await fetch(`${process.env.API_URL}/users/audiences/${encodeURIComponent(uuid)}/resolve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const response = await backend.json();
    return NextResponse.json(response, { status: backend.status });
  } catch {
    return NextResponse.json({ success: false, messages: ["An error occurred"] }, { status: 500 });
  }
}
