import { describe, expect, it } from "vitest";
import { isCommunityVerified } from "./community-verification";

describe("community verification for participation", () => {
  const when = "2026-11-14T10:00:00Z";

  it("accepts community verification without an ID check", () => {
    expect(isCommunityVerified({ community_verified_at: when })).toBe(true);
    expect(isCommunityVerified({ verified_at: when })).toBe(true);
  });

  it("does not accept an ID approval or the display badge as authorization", () => {
    const user = { community_verified_at: null, id_verification_approved: true, verification_badge: "identity" };
    expect(isCommunityVerified(user)).toBe(false);
    expect(isCommunityVerified({ ...user, verified_at: when })).toBe(false);
    expect(isCommunityVerified(null)).toBe(false);
  });
});
