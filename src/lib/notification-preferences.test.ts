import { describe, expect, it } from "vitest";
import { NOTIFICATION_CATEGORIES, parseNotificationPreferences } from "./notification-preferences";

const defaults = () =>
  Object.fromEntries(
    NOTIFICATION_CATEGORIES.map((category) => [
      category,
      { in_app: category !== "announcements", push: category !== "announcements" },
    ]),
  );

describe("notification preference contract", () => {
  it("preserves optional verification emails without adding unsupported email channels", () => {
    const input = {
      ...defaults(),
      verifications: { in_app: true, push: false, email: true },
      account_status: { in_app: false, push: true, email: false },
    };
    const parsed = parseNotificationPreferences(input);
    expect(parsed.verifications.email).toBe(true);
    expect(parsed.account_status.email).toBe(false);
    expect(parsed.security).not.toHaveProperty("email");
    expect(() =>
      parseNotificationPreferences({ ...input, security: { in_app: true, push: true, email: true } }),
    ).toThrow();
    expect(() =>
      parseNotificationPreferences({ ...input, verifications: { in_app: true, push: true, email: "false" } }),
    ).toThrow();
  });
  it("preserves each category and delivery channel without inventing consent", () => {
    const input = defaults();
    input.security = { in_app: false, push: true };
    const result = parseNotificationPreferences(input);
    expect(result.security).toEqual({ in_app: false, push: true });
    expect(result.announcements).toEqual({ in_app: false, push: false });
    expect(Object.keys(result)).toEqual([...NOTIFICATION_CATEGORIES]);
    expect(result.security).not.toBe(input.security);
  });
  it.each([
    null,
    [],
    {},
    { ...defaults(), security: { push: true } },
    { ...defaults(), security: { in_app: true, push: "false" } },
    { ...defaults(), announcements: { in_app: 0, push: false } },
  ])("rejects incomplete or nonboolean preferences %#", (input) => {
    expect(() => parseNotificationPreferences(input)).toThrow("Invalid notification preferences");
  });
});
