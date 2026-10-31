import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";

/**
 * /api/account/audiences/[uuid]
 *
 * Thin per-audience proxy. Written by hand because the generic
 * `proxyJsonPost` / `proxyGet` helpers take a static endpoint at module
 * load — this one needs the uuid interpolated per request. The backend
 * gates ownership: audiences owned by another user 404.
 *
 * PATCH edits metadata (name / description). DELETE returns 409
 * `audience_referenced_by_active_poll` when a poll is inside its voting
 * window; the response body includes `active_poll_ids`.
 */
async function forward(
  req: NextRequest,
  uuid: string,
  method: "GET" | "PATCH" | "DELETE",
  body: unknown = null,
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user.accessToken) {
    return NextResponse.json({ success: false, messages: ["Unauthorized"] }, { status: 401 });
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${session.user.accessToken}`,
  };
  if (body !== null) headers["Content-Type"] = "application/json";

  const backend = await fetch(`${process.env.API_URL}/users/audiences/${encodeURIComponent(uuid)}`, {
    method,
    headers,
    body: body !== null ? JSON.stringify(body) : undefined,
  });

  const response = await backend.json();
  return NextResponse.json(response, { status: backend.status });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  try {
    const { uuid } = await params;
    return await forward(req, uuid, "GET");
  } catch {
    return NextResponse.json({ success: false, messages: ["An error occurred"] }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  try {
    const { uuid } = await params;
    const body = await req.json();
    return await forward(req, uuid, "PATCH", body);
  } catch {
    return NextResponse.json({ success: false, messages: ["An error occurred"] }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ uuid: string }> }) {
  try {
    const { uuid } = await params;
    // Backend's `recaptcha` middleware reads the token from the JSON body
    // for DELETE requests too, so we still forward whatever the client
    // sent (empty object is fine).
    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    return await forward(req, uuid, "DELETE", body);
  } catch {
    return NextResponse.json({ success: false, messages: ["An error occurred"] }, { status: 500 });
  }
}
