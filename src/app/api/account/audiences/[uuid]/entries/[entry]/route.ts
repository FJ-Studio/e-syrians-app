import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../../../auth";

/**
 * DELETE /api/account/audiences/[uuid]/entries/[entry] — remove a
 * single audience entry. Backend gates ownership + validates the
 * numeric entry id via `whereNumber('entry')`.
 *
 * Recaptcha token comes through the body (Laravel's Request::input()
 * reads DELETE bodies just fine).
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ uuid: string; entry: string }> }) {
  try {
    const session = await auth();
    if (!session?.user.accessToken) {
      return NextResponse.json({ success: false, messages: ["Unauthorized"] }, { status: 401 });
    }

    const { uuid, entry } = await params;
    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const backend = await fetch(
      `${process.env.API_URL}/users/audiences/${encodeURIComponent(uuid)}/entries/${encodeURIComponent(entry)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify(body),
      },
    );

    const response = await backend.json();
    return NextResponse.json(response, { status: backend.status });
  } catch {
    return NextResponse.json({ success: false, messages: ["An error occurred"] }, { status: 500 });
  }
}
