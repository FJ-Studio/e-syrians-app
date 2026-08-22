import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../../../auth";

/**
 * POST /api/account/audiences/[uuid]/entries/bulk-remove
 *
 * Bulk-remove entries in one call. Fans out to the backend at
 * `POST /users/audiences/{uuid}/entries/_bulk-remove`. Used by the
 * audience-detail bulk-selection toolbar; the old code path issued
 * N parallel DELETEs, which multiplied recaptcha + throttle cost
 * and easily produced partial-delete outcomes.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  try {
    const session = await auth();
    if (!session?.user.accessToken) {
      return NextResponse.json({ success: false, messages: ["Unauthorized"] }, { status: 401 });
    }

    const { uuid } = await params;
    const body = await req.json();

    const backend = await fetch(
      `${process.env.API_URL}/users/audiences/${encodeURIComponent(uuid)}/entries/_bulk-remove`,
      {
        method: "POST",
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
