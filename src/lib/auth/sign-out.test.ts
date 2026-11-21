import { encode } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGIN = "https://website.example.test";
const API = "https://api.example.test";
const SECRET = "isolated-auth-handler-test-secret-not-a-production-credential";
const COOKIE = "__Secure-authjs.session-token";
const CURRENT = "fixture-current-device-api-token";
const OTHER = "fixture-other-device-api-token";
let handlers: typeof import("../../../auth").handlers;
const fetchMock = vi.fn<typeof fetch>();
const warnMock = vi.fn();

async function sessionJwt(accessToken: unknown, extra: Record<string, unknown> = {}) {
  return encode({
    secret: SECRET,
    salt: COOKIE,
    token: { esUser: { id: "17", uuid: "same-user", name: "Existing member", accessToken, ...extra } },
  });
}

async function csrf() {
  const response = await handlers.GET(new NextRequest(`${ORIGIN}/api/auth/csrf`));
  const { csrfToken } = await response.json();
  const cookies = response.headers.getSetCookie().map((cookie) => cookie.split(";")[0]);
  return { csrfToken: csrfToken as string, cookies };
}

async function logout(jwt?: string, fields: Record<string, string> = {}, headers: Record<string, string> = {}) {
  const proof = await csrf();
  return handlers.POST(
    new NextRequest(`${ORIGIN}/api/auth/signout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: [...proof.cookies, ...(jwt ? [`${COOKIE}=${jwt}`] : [])].join("; "),
        ...headers,
      },
      body: new URLSearchParams({ csrfToken: proof.csrfToken, callbackUrl: `${ORIGIN}/en/auth/sign-in`, ...fields }),
    }),
  );
}

function expectCleared(response: Response, names = [COOKIE]) {
  for (const name of names) {
    expect(
      response.headers.getSetCookie().some((cookie) => cookie.startsWith(`${name}=;`) && /max-age=0/i.test(cookie)),
    ).toBe(true);
  }
}

beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv("AUTH_URL", ORIGIN);
  vi.stubEnv("AUTH_SECRET", SECRET);
  vi.stubEnv("AUTH_TRUST_HOST", "true");
  vi.stubEnv("AUTH_GOOGLE_ID", "fixture-google-client");
  vi.stubEnv("AUTH_GOOGLE_SECRET", "fixture-google-secret");
  vi.stubEnv("API_URL", API);
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
  warnMock.mockReset();
  vi.spyOn(console, "warn").mockImplementation(warnMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal("fetch", fetchMock);
  handlers = (await import("../../../auth")).handlers;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("current-session web logout through the real Auth.js HTTP handler", () => {
  it("revokes only this cookie's API token and leaves another session for the same user untouched", async () => {
    const active = new Set([CURRENT, OTHER]);
    fetchMock.mockImplementation(async (url, init) => {
      expect(url).toBe(`${API}/users/logout`);
      const credential = new Headers(init?.headers).get("Authorization")!.slice("Bearer ".length);
      active.delete(credential);
      return new Response(null, { status: 204 });
    });
    const otherJwt = await sessionJwt(OTHER);

    const response = await logout(await sessionJwt(CURRENT));

    expect(response.status).toBe(302);
    expectCleared(response);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0][1]!;
    expect(init.method).toBe("POST");
    expect(init.cache).toBe("no-store");
    expect(init.redirect).toBe("error");
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(active.has(CURRENT)).toBe(false);
    expect(active.has(OTHER)).toBe(true);
    const otherSession = await handlers.GET(
      new NextRequest(`${ORIGIN}/api/auth/session`, { headers: { Cookie: `${COOKIE}=${otherJwt}` } }),
    );
    expect((await otherSession.json()).user.accessToken).toBe(OTHER);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(warnMock).not.toHaveBeenCalled();
    const guest = await handlers.GET(new NextRequest(`${ORIGIN}/api/auth/session`));
    expect(await guest.json()).toBeNull();
  });

  it("ignores API-token overrides in the sign-out body and incoming Authorization header", async () => {
    const response = await logout(
      await sessionJwt(CURRENT),
      { token: OTHER, accessToken: OTHER },
      { Authorization: `Bearer ${OTHER}` },
    );

    expectCleared(response);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get("Authorization")).toBe(`Bearer ${CURRENT}`);
  });

  it("does not allow a profile update to change the token or identity later used for logout", async () => {
    const proof = await csrf();
    const update = await handlers.POST(
      new NextRequest(`${ORIGIN}/api/auth/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: [...proof.cookies, `${COOKIE}=${await sessionJwt(CURRENT)}`].join("; "),
        },
        body: JSON.stringify({
          csrfToken: proof.csrfToken,
          data: { accessToken: OTHER, id: "another-id", uuid: "another-user", name: "Updated profile" },
        }),
      }),
    );

    expect(update.status).toBe(200);
    expect((await update.json()).user).toMatchObject({
      id: "17",
      uuid: "same-user",
      accessToken: CURRENT,
      name: "Updated profile",
    });
    const refreshed = update.headers.getSetCookie().find((cookie) => cookie.startsWith(`${COOKIE}=`))!;
    const refreshedJwt = refreshed.split(";")[0].slice(`${COOKIE}=`.length);
    const response = await logout(refreshedJwt);

    expectCleared(response);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get("Authorization")).toBe(`Bearer ${CURRENT}`);
  });

  it("rejects a bad CSRF proof without revoking the API token", async () => {
    const response = await logout(await sessionJwt(CURRENT), { csrfToken: "wrong-csrf-proof" });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.headers.getSetCookie().some((cookie) => cookie.startsWith(`${COOKIE}=;`))).toBe(false);
  });

  it("supports chunked session cookies for larger profiles and clears every chunk", async () => {
    const jwt = await sessionJwt(CURRENT, { more_info: "large-profile".repeat(600) });
    const proof = await csrf();
    const names: string[] = [];
    const chunks: string[] = [];
    for (let start = 0, index = 0; start < jwt.length; start += 2000, index++) {
      const name = `${COOKIE}.${index}`;
      names.push(name);
      chunks.push(`${name}=${jwt.slice(start, start + 2000)}`);
    }

    const response = await handlers.POST(
      new NextRequest(`${ORIGIN}/api/auth/signout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: [...proof.cookies, ...chunks].join("; "),
        },
        body: new URLSearchParams({ csrfToken: proof.csrfToken }),
      }),
    );

    expect(names.length).toBeGreaterThan(1);
    expectCleared(response, names);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get("Authorization")).toBe(`Bearer ${CURRENT}`);
  });

  it("treats an already-revoked API token as a successful, idempotent logout", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));

    const response = await logout(await sessionJwt(CURRENT));

    expectCleared(response);
    expect(warnMock).not.toHaveBeenCalled();
  });

  it("still clears the browser session on an API failure and logs no token or response body", async () => {
    fetchMock.mockResolvedValue(new Response(`backend detail: ${CURRENT} ${OTHER}`, { status: 503 }));

    const response = await logout(await sessionJwt(CURRENT));

    expectCleared(response);
    expect(warnMock).toHaveBeenCalledExactlyOnceWith("[auth] API logout failed", { status: 503 });
    expect(JSON.stringify(warnMock.mock.calls)).not.toContain(CURRENT);
    expect(JSON.stringify(warnMock.mock.calls)).not.toContain(OTHER);
  });

  it("still clears the browser session on a network failure without logging raw errors", async () => {
    fetchMock.mockRejectedValue(new Error(`network diagnostic contains ${CURRENT}`));

    const response = await logout(await sessionJwt(CURRENT));

    expectCleared(response);
    expect(warnMock).toHaveBeenCalledExactlyOnceWith("[auth] API logout did not complete");
    expect(JSON.stringify(warnMock.mock.calls)).not.toContain(CURRENT);
  });

  it("bounds API revocation to five seconds and still clears the cookie on timeout", async () => {
    const controller = new AbortController();
    const timeout = vi.spyOn(AbortSignal, "timeout").mockReturnValue(controller.signal);
    fetchMock.mockImplementation(
      async (_url, init) =>
        new Promise((_resolve, reject) => {
          init!.signal!.addEventListener("abort", () => reject(new Error("timed out")), { once: true });
        }),
    );
    const pending = logout(await sessionJwt(CURRENT));
    try {
      await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
      expect(timeout).toHaveBeenCalledWith(5000);
    } finally {
      controller.abort();
    }

    expectCleared(await pending);
    expect(warnMock).toHaveBeenCalledExactlyOnceWith("[auth] API logout did not complete");
  });

  it("does not make an API request for a guest logout", async () => {
    await logout();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([undefined, "", null, 123])(
    "clears a session with an unusable API token (%s) without an account-wide fallback",
    async (token) => {
      const response = await logout(await sessionJwt(token));

      expectCleared(response);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("clears an invalid NextAuth cookie without attempting API revocation", async () => {
    const response = await logout("invalid-encrypted-session");

    expectCleared(response);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not send a token to an unconfigured API endpoint", async () => {
    vi.stubEnv("API_URL", "");

    const response = await logout(await sessionJwt(CURRENT));

    expectCleared(response);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(warnMock).toHaveBeenCalledExactlyOnceWith("[auth] API logout skipped: API_URL is not configured");
  });

  it("normalizes a configured API URL's trailing slash", async () => {
    vi.stubEnv("API_URL", `${API}/`);

    const response = await logout(await sessionJwt(CURRENT));

    expectCleared(response);
    expect(fetchMock.mock.calls[0][0]).toBe(`${API}/users/logout`);
  });
});
