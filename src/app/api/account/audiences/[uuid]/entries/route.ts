import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";

/**
 * POST /api/account/audiences/[uuid]/entries — append new entries
 * (paste-only, capped at 5000 per call, dedupes automatically).
 *
 * Hand-written because the generic `proxyJsonPost` helper takes a
 * static endpoint at module load — this one needs the uuid
 * interpolated per request. The backend gates ownership (404s for
 * foreign audiences) and enforces recaptcha + throttling.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  try {
    const session = await auth();
    if (!session?.user.accessToken) {
      return NextResponse.json({ success: false, messages: ["Unauthorized"] }, { status: 401 });
    }

    const { uuid } = await params;
    const body = await req.json();

    const backend = await fetch(`${process.env.API_URL}/users/audiences/${encodeURIComponent(uuid)}/entries`, {
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
