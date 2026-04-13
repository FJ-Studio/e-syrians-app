import { describe, expect, it } from "vitest";
import isVerified, { hasEnoughVerifications, isFirstRegistrant } from "./is-verified";
import { ESUser } from "./types/account";

// Tests operate on the verification subset of ESUser. A partial cast keeps
// the fixtures focused on the fields under test.
const makeUser = (overrides: Partial<ESUser>): ESUser => ({ ...overrides }) as ESUser;

describe("isFirstRegistrant", () => {
  it("is true when the verification_reason is first_registrant", () => {
    expect(isFirstRegistrant(makeUser({ verification_reason: "first_registrant" }))).toBe(true);
  });

  it("is false for any other reason", () => {
    expect(isFirstRegistrant(makeUser({ verification_reason: "verifiers" }))).toBe(false);
    expect(isFirstRegistrant(makeUser({ verification_reason: "" }))).toBe(false);
  });
});

describe("hasEnoughVerifications", () => {
  it("is true when the verification_reason is verifiers", () => {
    expect(hasEnoughVerifications(makeUser({ verification_reason: "verifiers" }))).toBe(true);
  });

  it("is false for any other reason", () => {
    expect(hasEnoughVerifications(makeUser({ verification_reason: "first_registrant" }))).toBe(false);
    expect(hasEnoughVerifications(makeUser({ verification_reason: "pending" }))).toBe(false);
  });
});

describe("isVerified", () => {
  it("is true when verified_at is set and the reason is first_registrant", () => {
    expect(isVerified(makeUser({ verified_at: "2024-01-01T00:00:00Z", verification_reason: "first_registrant" }))).toBe(
      true,
    );
  });

  it("is true when verified_at is set and the reason is verifiers", () => {
    expect(isVerified(makeUser({ verified_at: "2024-01-01T00:00:00Z", verification_reason: "verifiers" }))).toBe(true);
  });

  it("is false when verified_at is null even with a valid reason", () => {
    expect(
      isVerified(
        makeUser({
          verified_at: null as unknown as string,
          verification_reason: "verifiers",
        }),
      ),
    ).toBe(false);
  });

  it("is false when the reason is unknown even if verified_at is set", () => {
    expect(isVerified(makeUser({ verified_at: "2024-01-01T00:00:00Z", verification_reason: "other" }))).toBe(false);
  });
});
