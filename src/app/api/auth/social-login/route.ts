import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy that forwards a social login request from the browser
 * to the Laravel API. Used by the Apple sign-in popup flow:
 *   client → /api/auth/social-login (this route) → API /users/login/social
 *
 * The browser never talks to the API directly because we want to keep the
 * API URL out of client bundles and let the API see this server's IP/UA.
 *
 * Request body shape: { provider: "apple", token: <identity_token> }
 * Response shape: the API's standard { success, data, message } envelope.
 */
export async function POST(request: NextRequest) {
  let body: { provider?: string; token?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "INVALID_BODY" }, { status: 400 });
  }

  if (!body?.provider || !body?.token) {
    return NextResponse.json({ success: false, message: "MISSING_PROVIDER_OR_TOKEN" }, { status: 400 });
  }

  // Apple sends the user's name only on the very first sign-in. When present,
  // forward it so the API can store it on user creation.
  const name = typeof body.name === "string" ? body.name.trim() : "";

  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    return NextResponse.json({ success: false, message: "API_URL_NOT_CONFIGURED" }, { status: 500 });
  }

  let res: Response;
  try {
    res = await fetch(`${apiUrl}/users/login/social`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        provider: body.provider,
        token: body.token,
        ...(name ? { name } : {}),
      }),
    });
  } catch {
    return NextResponse.json({ success: false, message: "AUTH_SERVER_UNREACHABLE" }, { status: 502 });
  }

  // Pass the API's response straight through, preserving the status code.
  const data = await res.json().catch(() => null);
  return NextResponse.json(data ?? { success: false }, { status: res.status });
}
