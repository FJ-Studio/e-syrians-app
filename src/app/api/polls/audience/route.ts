import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";

/**
 * GET /api/polls/audience?poll_id=...
 *
 * Returns the audience criteria for a given poll. Forwards the auth
 * token when available so the backend can expose allowed-voters
 * details to the poll creator.
 */
export async function GET(req: NextRequest) {
  const pollId = req.nextUrl.searchParams.get("poll_id");
  if (!pollId) {
    return NextResponse.json({ success: false, messages: ["poll_id is required"] }, { status: 400 });
  }

  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    return NextResponse.json({ success: false, messages: ["API_URL_NOT_CONFIGURED"] }, { status: 500 });
  }

  const headers: Record<string, string> = { Accept: "application/json" };

  const session = await auth();
  if (session?.user.accessToken) {
    headers.Authorization = `Bearer ${session.user.accessToken}`;
  }

  const url = `${apiUrl}/polls/audience?poll_id=${encodeURIComponent(pollId)}`;

  let upstream: Response;
  try {
    upstream = await fetch(url, { headers });
  } catch {
    return NextResponse.json({ success: false, messages: ["AUTH_SERVER_UNREACHABLE"] }, { status: 502 });
  }

  // Tolerate non-JSON responses (e.g. 502 with HTML error page) without
  // crashing the route — surface a controlled error instead.
  const body = await upstream.json().catch(() => null);
  if (body === null) {
    return NextResponse.json({ success: false, messages: ["INVALID_UPSTREAM_RESPONSE"] }, { status: 502 });
  }

  return NextResponse.json(body, { status: upstream.status });
}
