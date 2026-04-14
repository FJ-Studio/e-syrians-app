import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the NextAuth `auth()` helper before importing the module under test.
// proxyJsonPost → withApiRoute → auth() — we need a predictable session.
vi.mock("../../auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "../../auth";
import { proxyJsonPost, proxyPublicJsonPost } from "./api-route";

const mockAuth = vi.mocked(auth);

interface FetchCall {
  url: string;
  init: RequestInit;
}

interface FakeResponse {
  body: unknown;
  status: number;
}

interface FetchMock {
  calls: FetchCall[];
  responses: FakeResponse[];
  respond: (body: unknown, status?: number) => void;
}

function installFetchMock(): FetchMock {
  const state: FetchMock = {
    calls: [],
    responses: [],
    respond(body, status = 200) {
      state.responses.push({ body, status });
    },
  };

  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      state.calls.push({ url, init });
      const { body, status } = state.responses.shift() ?? { body: { success: true }, status: 200 };
      return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => body,
      } as unknown as Response;
    }),
  );

  return state;
}

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/any", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function readForwardedBody(init: RequestInit): Record<string, unknown> {
  return JSON.parse(init.body as string);
}

describe("proxyJsonPost", () => {
  beforeEach(() => {
    process.env.API_URL = "https://api.test";
    mockAuth.mockResolvedValue({
      user: {
        accessToken: "token-xyz",
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    mockAuth.mockReset();
  });

  it("forwards recaptcha_token along with the rest of the body when no transform is provided", async () => {
    const fetchState = installFetchMock();
    const handler = proxyJsonPost({ endpoint: "/users/do-thing" });

    const response = await handler(
      makeRequest({
        foo: "bar",
        recaptcha_token: "captcha-123",
      }),
    );

    expect(response.status).toBe(200);
    expect(fetchState.calls).toHaveLength(1);
    const [call] = fetchState.calls;
    expect(call.url).toBe("https://api.test/users/do-thing");
    expect(call.init.method).toBe("POST");
    expect((call.init.headers as Record<string, string>).Authorization).toBe("Bearer token-xyz");
    expect(readForwardedBody(call.init)).toEqual({
      foo: "bar",
      recaptcha_token: "captcha-123",
    });
  });

  it("preserves recaptcha_token when transformBody explicitly returns it", async () => {
    const fetchState = installFetchMock();
    const handler = proxyJsonPost({
      endpoint: "/users/change-password",
      transformBody: (body) => ({
        current_password: body.currentPassword,
        new_password: body.newPassword,
        recaptcha_token: body.recaptcha_token,
      }),
    });

    await handler(
      makeRequest({
        currentPassword: "old",
        newPassword: "new",
        recaptcha_token: "captcha-456",
      }),
    );

    expect(readForwardedBody(fetchState.calls[0].init)).toEqual({
      current_password: "old",
      new_password: "new",
      recaptcha_token: "captcha-456",
    });
  });

  it("drops fields that transformBody intentionally omits (regression guard for captcha stripping)", async () => {
    // This documents the contract: if a route's transform does NOT return
    // recaptcha_token, it will not reach Laravel. Any recaptcha-protected
    // endpoint must include it explicitly in its transform.
    const fetchState = installFetchMock();
    const handler = proxyJsonPost({
      endpoint: "/feature-requests",
      transformBody: (body) => ({
        title: body.title,
        description: body.description,
      }),
    });

    await handler(
      makeRequest({
        title: "T",
        description: "D",
        recaptcha_token: "captcha-789",
      }),
    );

    const forwarded = readForwardedBody(fetchState.calls[0].init);
    expect(forwarded).toEqual({ title: "T", description: "D" });
    expect(forwarded).not.toHaveProperty("recaptcha_token");
  });

  it("returns 401 when the session has no access token", async () => {
    installFetchMock();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockAuth.mockResolvedValue(null as any);
    const handler = proxyJsonPost({ endpoint: "/users/do-thing" });

    const response = await handler(makeRequest({ recaptcha_token: "t" }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ success: false, messages: ["Unauthorized"] });
  });
});

describe("proxyPublicJsonPost", () => {
  beforeEach(() => {
    process.env.API_URL = "https://api.test";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("forwards the body (including recaptcha_token) verbatim without requiring auth", async () => {
    const fetchState = installFetchMock();
    const handler = proxyPublicJsonPost({ endpoint: "/users/forgot-password" });

    await handler(
      makeRequest({
        email: "a@b.com",
        recaptcha_token: "public-captcha",
      }),
    );

    expect(fetchState.calls).toHaveLength(1);
    const [call] = fetchState.calls;
    expect(call.url).toBe("https://api.test/users/forgot-password");
    expect((call.init.headers as Record<string, string>).Authorization).toBeUndefined();
    expect(readForwardedBody(call.init)).toEqual({
      email: "a@b.com",
      recaptcha_token: "public-captcha",
    });
  });
});
