import type { JWT } from "next-auth/jwt";
import type { ESUser } from "../types/account";

type SignOutMessage = { token: JWT | null } | { session: unknown };

/** Revoke only the API credential carried by the authenticated NextAuth JWT. */
export async function revokeSessionApiToken(message: SignOutMessage): Promise<void> {
  if (!("token" in message)) return;

  const accessToken = (message.token?.esUser as Partial<ESUser> | undefined)?.accessToken;
  if (typeof accessToken !== "string" || !accessToken) return;

  const apiUrl = process.env.API_URL?.replace(/\/+$/, "");
  if (!apiUrl) {
    console.warn("[auth] API logout skipped: API_URL is not configured");
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/users/logout`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    });

    // An expired/already-revoked credential is an idempotent sign-out.
    if (!response.ok && response.status !== 401) {
      console.warn("[auth] API logout failed", { status: response.status });
    }
  } catch {
    // Never prevent NextAuth from clearing its cookie, or log the credential,
    // API response body, URL, or raw exception (which can contain secrets).
    console.warn("[auth] API logout did not complete");
  }
}
