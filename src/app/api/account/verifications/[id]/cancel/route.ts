import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";

/**
 * Cancel a verification the signed-in user previously issued.
 *
 * Mirrors the backend route exactly:
 *   POST /users/verifications/{verification}/cancel
 *
 * Verifier-only — the backend enforces ownership. The Next.js
 * layer is a thin auth-then-forward proxy; no body is needed
 * because the backend identifies the actor from the bearer token
 * and the target from the URL segment.
 *
 * Written by hand rather than via `proxyJsonPost` because the
 * generic helper takes a static `endpoint` string at module load
 * — this one needs the verification id interpolated per request.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user.accessToken) {
      return NextResponse.json({ success: false, messages: ["Unauthorized"] }, { status: 401 });
    }

    const { id } = await params;

    const backend = await fetch(`${process.env.API_URL}/users/verifications/${encodeURIComponent(id)}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });

    const response = await backend.json();
    return NextResponse.json(response, { status: backend.status });
  } catch {
    return NextResponse.json({ success: false, messages: ["An error occurred"] }, { status: 500 });
  }
}
