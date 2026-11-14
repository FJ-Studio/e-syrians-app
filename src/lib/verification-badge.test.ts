import { describe, expect, it } from "vitest";
import { verificationBadgeColors, verificationBadgeKind } from "./verification-badge";

describe("account verification badge", () => {
  it.each([
    [false, false, null],
    [true, false, "community"],
    [false, true, "identity"],
    [true, true, "both"],
  ] as const)("maps community=%s and ID approval=%s to %s", (community, identity, expected) => {
    expect(verificationBadgeKind(community, identity)).toBe(expected);
  });

  it("uses distinct gray, orange and green colors", () => {
    expect(verificationBadgeColors).toEqual({ community: "#667085", identity: "#B54708", both: "#087443" });
  });
});
