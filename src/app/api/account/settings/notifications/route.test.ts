import type { Session } from "next-auth";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { auth } from "../../../../../../auth";
import { GET, PATCH } from "./route";

vi.mock("../../../../../../auth", () => ({ auth: vi.fn() }));

const owner = "11111111-1111-4111-8111-111111111111";
const other = "22222222-2222-4222-8222-222222222222";
const payload = { user_uuid: owner, category: "security", channel: "push", enabled: false };
const mockAuth = vi.mocked(auth as () => Promise<Session | null>);
const fetch = vi.fn();
function request(method: "GET" | "PATCH", body: unknown = payload, expectedOwner: string = owner) {
  return new NextRequest("https://web.test/api/account/settings/notifications", {
    method,
    headers: { "Content-Type": "application/json", "X-Account-UUID": expectedOwner },
    ...(method === "PATCH" ? { body: JSON.stringify(body) } : {}),
  });
}
beforeEach(() => {
  vi.stubEnv("API_URL", "https://api.test");
  vi.stubGlobal("fetch", fetch);
  mockAuth.mockResolvedValue({
    user: { uuid: owner, accessToken: "private-test-token" },
    expires: "2099-01-01",
  } as Session);
  fetch.mockResolvedValue(Response.json({ success: true, data: { categories: {} } }));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("notification preference proxy", () => {
  it.each([GET, PATCH])("requires authentication before contacting the API", async (handler) => {
    mockAuth.mockResolvedValue(null);
    expect((await handler(request(handler === GET ? "GET" : "PATCH"))).status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each([GET, PATCH])(
    "rejects stale-account requests instead of applying them to the new session",
    async (handler) => {
      const response = await handler(request(handler === GET ? "GET" : "PATCH", payload, other));
      expect(response.status).toBe(409);
      expect(fetch).not.toHaveBeenCalled();
    },
  );
  it("forwards GET privately without caching or exposing credentials", async () => {
    const response = await GET(request("GET"));
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store, private");
    expect(await response.text()).not.toContain("private-test-token");
    expect(fetch).toHaveBeenCalledWith(
      "https://api.test/users/notification-preferences",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
        headers: expect.objectContaining({ Authorization: "Bearer private-test-token" }),
      }),
    );
  });
  it("uses PATCH and preserves explicit false for exactly one setting", async () => {
    const response = await PATCH(request("PATCH"));
    expect(response.status).toBe(200);
    expect(fetch.mock.calls[0][1].method).toBe("PATCH");
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(payload);
  });
  it("supports the optional verification email channel without touching other choices", async () => {
    const email = { ...payload, category: "verifications", channel: "email" };
    expect((await PATCH(request("PATCH", email))).status).toBe(200);
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(email);
  });
  it.each([
    { category: "unknown" },
    { channel: "email" },
    { enabled: "false" },
    { user_uuid: "invalid" },
    { feature_flag: true },
  ])("rejects invalid and admin-only payloads %#", async (bad) => {
    expect((await PATCH(request("PATCH", { ...payload, ...bad }))).status).toBe(422);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("does not let a valid header conceal another account in the body", async () => {
    expect((await PATCH(request("PATCH", { ...payload, user_uuid: other }))).status).toBe(409);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("returns 400 for malformed JSON", async () => {
    const req = new NextRequest("https://web.test/api/account/settings/notifications", {
      method: "PATCH",
      headers: { "X-Account-UUID": owner },
      body: "{broken",
    });
    expect((await PATCH(req)).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each([401, 403, 422, 429, 500])("preserves backend HTTP %s", async (status) => {
    fetch.mockResolvedValue(Response.json({ success: false, messages: ["backend_error"] }, { status }));
    const response = await PATCH(request("PATCH"));
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ success: false, messages: ["backend_error"] });
  });
  it("returns a safe error on transport failure", async () => {
    fetch.mockRejectedValue(new Error("private-test-token"));
    const response = await GET(request("GET"));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain("private-test-token");
  });
});
