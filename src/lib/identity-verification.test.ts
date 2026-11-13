import { describe, expect, it } from "vitest";
import {
  creditHistoryDays,
  creditHistoryDelta,
  entryAction,
  giftUnavailableReason,
  verificationCard,
  verificationCopy,
  verificationState,
  type CreditStatus,
  type VerificationSummary,
} from "./identity-verification";

const copy = verificationCopy("en");
const credit = (uuid: string, status: CreditStatus, can_gift = false) => ({ uuid, status, can_gift });
const summary = (credits: VerificationSummary["credits"] = [], can_claim = true): VerificationSummary => ({
  provider_ready: true,
  can_claim,
  credits,
});

describe("ID verification state", () => {
  it("offers the free claim only when the API allows it", () => {
    expect(verificationCard(summary(), copy).action).toEqual({ kind: "claim", label: copy.claim });
    expect(verificationCard(summary([], false), copy).action).toBeUndefined();
  });

  it("counts all unused credits, but only sends transferable ones", () => {
    const data = summary([credit("granted", "available"), credit("transferable", "available", true)]);
    const state = verificationState(data);
    expect(state.balance).toBe(2);
    expect(state.giftable?.uuid).toBe("transferable");
    expect(verificationCard(data, copy).action).toEqual({ kind: "start", credit: "granted", label: copy.start });
    expect(entryAction(state, copy)).toBe(copy.verify);
  });

  it.each(["creating", "pending"] as const)(
    "continues an existing %s attempt rather than using a new credit",
    (status) => {
      const data = summary([credit("new", "available", true), credit("existing", status)]);
      expect(verificationCard(data, copy).action).toEqual({ kind: "start", credit: "existing", label: copy.resume });
      expect(entryAction(verificationState(data), copy)).toBe(copy.resume);
    },
  );

  it("checks an in-review decision rather than starting another session", () => {
    const data = summary([credit("new", "available"), credit("review", "in_review")]);
    expect(verificationCard(data, copy).action).toEqual({ kind: "refresh", credit: "review", label: copy.check });
    expect(entryAction(verificationState(data), copy)).toBe(copy.viewStatus);
  });

  it("keeps a completed approval visible and identifies it as test-only", () => {
    const data = summary([credit("approved", "approved")]);
    const card = verificationCard(data, copy);
    expect(card.action).toBeUndefined();
    expect(card.body).toMatch(/doesn’t change your account/);
    expect(entryAction(verificationState(data), copy)).toBe(copy.viewResult);
  });

  it("lets an approved account use a received credit without letting it gift the credit again", () => {
    const data = summary([credit("received", "available"), credit("used", "approved")]);
    const state = verificationState(data);
    expect(state.balance).toBe(1);
    expect(verificationCard(data, copy)).toMatchObject({
      status: copy.approved,
      action: { kind: "start", credit: "received", label: copy.startAnother },
    });
    expect(entryAction(state, copy)).toBe(copy.startAnother);
    expect(giftUnavailableReason(state, copy)).toBe(copy.useOnly);
    expect(giftUnavailableReason(verificationState(summary()), copy)).toBe(copy.noGift);
  });

  it("distinguishes credit activity events, including purchases", () => {
    expect(["gift_sent", "gift_received", "admin_granted", "purchased", "claimed"].map(copy.historyEvent)).toEqual([
      "Gift sent",
      "Gift received",
      "Granted by an admin",
      "Credit purchased",
      "Free test credit claimed",
    ]);
  });

  it("groups entries by the viewer's calendar date without changing ledger order", () => {
    const items = [
      { id: 3, event: "purchased", occurred_at: "2026-11-12T08:00:00Z" },
      { id: 2, event: "gift_sent", occurred_at: "2026-11-12T07:59:00Z" },
      { id: 1, event: "gift_received", occurred_at: "2026-11-12T01:00:00Z" },
    ];
    const timeZone = "America/Los_Angeles";
    const days = creditHistoryDays(items, "en", timeZone);
    expect(days.map((day) => day.items.map((entry) => entry.id))).toEqual([[3], [2, 1]]);
    expect(days[1].items[0].time).toBe(
      new Intl.DateTimeFormat("en", { timeZone, timeStyle: "short" }).format(new Date(items[1].occurred_at)),
    );
  });

  it("shows only known credit movements, with a readable sign and an accessible label", () => {
    expect(
      ["gift_sent", "gift_received", "admin_granted", "purchased", "claimed", "other"].map(creditHistoryDelta),
    ).toEqual([-1, 1, 1, 1, 1, 0]);
    expect(copy.historyChange(-1)).toEqual({ value: "−1", label: "One credit removed" });
    expect(verificationCopy("ar").historyChange(1)).toEqual({
      value: `+${new Intl.NumberFormat("ar").format(1)}`,
      label: "أُضيف رصيد واحد",
    });
  });

  it("shows a live result without test copy and never offers a reversed credit", () => {
    const live = verificationCopy("en", true);
    const data = summary([credit("refunded", "revoked", true), credit("finished", "approved")], false);
    expect(verificationState(data)).toMatchObject({ balance: 0, giftable: undefined });
    expect(verificationCard(data, live)).toMatchObject({ status: "Approved", action: undefined });
    expect(live.buy("€3.00")).toBe("Buy one credit · €3.00");
    expect(live.safety).not.toMatch(/sample document/);
  });

  it("retries a declined result using an available credit, not the spent one", () => {
    const declined = credit("spent", "declined");
    expect(verificationCard(summary([declined, credit("unused", "available")]), copy).action).toEqual({
      kind: "start",
      credit: "unused",
      label: copy.retry,
    });
    expect(verificationCard(summary([declined]), copy).action?.kind).toBe("claim");
    expect(verificationCard(summary([declined], false), copy).action).toBeUndefined();
  });

  it("keeps RTL copy and balance plurals localized", () => {
    const ar = verificationCopy("ar");
    expect(ar.balance(1)).toBe("رصيد واحد متاح");
    expect(ar.balance(2)).toBe("رصيدان متاحان");
    expect(ar.balance(3)).toMatch(/أرصدة/);
    expect(verificationCard(summary([credit("available", "available")]), ar).action?.label).toBe(ar.start);
  });
});
