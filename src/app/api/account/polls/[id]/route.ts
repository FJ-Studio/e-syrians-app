import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";

/**
 * PATCH /api/account/polls/[id]
 *
 * Proxies to the backend's PATCH /polls/{id} (editable polls
 * endpoint). The backend's UpdatePollRequest gates on ownership +
 * the zero-votes rule and returns a 403 with
 * `poll_has_votes_cannot_edit` or `not_your_poll` when the gate
 * fails — both are translated by the client's useServerError hook.
 *
 * The create flow on this app posts multipart/form-data because
 * its older controller predates the JSON-body proxies. The edit
 * page also sends FormData for consistency; we unwrap it here
 * into a plain JSON object so the Laravel validators see the
 * same input shape they always have (Laravel's request parsing
 * normalises both formats, so this conversion is paranoia —
 * but it's cheap and keeps the wire format explicit).
 *
 * Written by hand rather than via `proxyJsonPost` because the
 * generic helper takes a static `endpoint` string at module load
 * — this one needs the poll id interpolated per request, and
 * uses PATCH not POST.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user.accessToken) {
      return NextResponse.json({ success: false, messages: ["Unauthorized"] }, { status: 401 });
    }

    const { id } = await params;

    // Read the FormData and flatten into a plain object the
    // backend can consume as JSON. Bracket-notation arrays
    // (`options[]`, `gender[]`, etc.) collapse to real arrays.
    const formData = await req.formData();
    const payload: Record<string, unknown> = {};
    for (const [rawKey, value] of formData.entries()) {
      const isArrayKey = rawKey.endsWith("[]");
      const key = isArrayKey ? rawKey.slice(0, -2) : rawKey;
      if (isArrayKey) {
        const existing = payload[key];
        if (Array.isArray(existing)) {
          existing.push(value);
        } else {
          payload[key] = [value];
        }
      } else if (key === "audience_uuid" && value === "") {
        payload[key] = null;
      } else {
        payload[key] = value;
      }
    }

    const backend = await fetch(`${process.env.API_URL}/polls/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const response = await backend.json();
    return NextResponse.json(response, { status: backend.status });
  } catch {
    return NextResponse.json({ success: false, messages: ["An error occurred"] }, { status: 500 });
  }
}
