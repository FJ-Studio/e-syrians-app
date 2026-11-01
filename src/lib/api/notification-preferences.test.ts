import { afterEach, describe, expect, it, vi } from "vitest";
import { NOTIFICATION_CATEGORIES } from "../notification-preferences";
import { readNotificationPreferences, saveNotificationPreference } from "./notification-preferences";

const categories = Object.fromEntries(
  NOTIFICATION_CATEGORIES.map((category) => [category, { in_app: false, push: true }]),
);
afterEach(() => vi.unstubAllGlobals());

describe("notification preferences client", () => {
  it("loads fresh account-bound preferences without exposing a bearer token", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ success: true, data: { categories } }));
    vi.stubGlobal("fetch", fetch);
    expect(await readNotificationPreferences("owner")).toEqual(categories);
    expect(fetch).toHaveBeenCalledWith(
      "/api/account/settings/notifications",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
        signal: expect.any(AbortSignal),
        headers: { Accept: "application/json", "Content-Type": "application/json", "X-Account-UUID": "owner" },
      }),
    );
  });
  it("patches only the selected account category and channel", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ success: true, data: { categories } }));
    vi.stubGlobal("fetch", fetch);
    await saveNotificationPreference("owner", "security", "push", false);
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      user_uuid: "owner",
      category: "security",
      channel: "push",
      enabled: false,
    });
    expect(fetch.mock.calls[0][1].method).toBe("PATCH");
  });
  it.each([
    {},
    { success: "true", data: { categories } },
    { success: false, data: { categories } },
    { success: true, data: { categories: { security: { push: true } } } },
  ])("rejects malformed success responses %#", async (data) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(data)));
    await expect(readNotificationPreferences("owner")).rejects.toThrow();
  });
  it.each([401, 409, 422, 429, 500])("does not claim a preference was saved on HTTP %s", async (status) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ success: true, data: { categories } }, { status })),
    );
    await expect(saveNotificationPreference("owner", "announcements", "in_app", true)).rejects.toThrow();
  });
  it("propagates timeout and network errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(readNotificationPreferences("owner")).rejects.toThrow("offline");
  });
});
