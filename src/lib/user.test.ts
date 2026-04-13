import { describe, expect, it } from "vitest";
import { APP_URL } from "./constants/misc";
import { ESUser } from "./types/account";
import { getUrl } from "./user";

const makeUser = (uuid: string): ESUser => ({ uuid }) as ESUser;

describe("getUrl", () => {
  it("builds the public verification URL from the user's uuid", () => {
    const url = getUrl(makeUser("abc-123"));
    expect(url).toBe(`${APP_URL}/census/v/abc-123`);
  });

  it("returns a URL even when the uuid is empty (edge case, not guarded)", () => {
    const url = getUrl(makeUser(""));
    expect(url).toBe(`${APP_URL}/census/v/`);
  });

  it("uses the app-level APP_URL constant as the base", () => {
    const url = getUrl(makeUser("x"));
    expect(url.startsWith(APP_URL)).toBe(true);
  });
});
