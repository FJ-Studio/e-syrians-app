import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function request(body: object) {
  return new NextRequest("https://www.e-syrians.com/api/auth/social-login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("Apple social login proxy", () => {
  it("forwards the single-use code without trusting a browser client ID", async () => {
    vi.stubEnv("API_URL", "https://api.example.test");
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ success: true, data: { token: "session" } }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await POST(
      request({
        provider: "apple",
        token: "identity",
        authorization_code: "code",
        client_id: "untrusted",
        name: " Test Citizen ",
      }),
    );
    expect(response.status).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      provider: "apple",
      token: "identity",
      authorization_code: "code",
      name: "Test Citizen",
    });
  });

  it.each([undefined, "", "   ", 123])("rejects missing or invalid codes (%s)", async (code) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect((await POST(request({ provider: "apple", token: "identity", authorization_code: code }))).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves API failures without minting a session", async () => {
    vi.stubEnv("API_URL", "https://api.example.test");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ success: false }, { status: 401 })));
    const response = await POST(request({ provider: "apple", token: "identity", authorization_code: "expired" }));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ success: false });
  });
});
