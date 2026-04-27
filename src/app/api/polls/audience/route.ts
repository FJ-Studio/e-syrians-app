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

  const headers: Record<string, string> = { Accept: "application/json" };

  const session = await auth();
  if (session?.user.accessToken) {
    headers.Authorization = `Bearer ${session.user.accessToken}`;
  }

  const url = `${process.env.API_URL}/polls/audience?poll_id=${encodeURIComponent(pollId)}`;
  const request = await fetch(url, { headers });
  const response = await request.json();
  return NextResponse.json(response, { status: request.status });
}
