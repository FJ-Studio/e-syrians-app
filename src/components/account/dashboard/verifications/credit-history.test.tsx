import { verificationCopy } from "@/lib/identity-verification";
import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CreditHistory from "./credit-history";

const copy = verificationCopy("en", true);
function renderHistory(overrides: Partial<ComponentProps<typeof CreditHistory>>) {
  return renderToStaticMarkup(
    <CreditHistory
      copy={copy}
      locale="en"
      loading={false}
      failed={false}
      onPageChange={() => {}}
      onRetry={() => {}}
      {...overrides}
    />,
  );
}

describe("Credit history ledger", () => {
  it("shows signed credit movements, accessible labels and the original event timestamps", () => {
    const html = renderHistory({
      history: {
        page: 1,
        last_page: 2,
        items: [
          { id: 2, event: "gift_sent", occurred_at: "2026-11-12T08:00:00Z" },
          { id: 1, event: "purchased", occurred_at: "2026-11-11T08:00:00Z" },
        ],
      },
    });
    expect(html.match(/<h3\b/g)).toHaveLength(2);
    expect(html).toContain('dateTime="2026-11-12T08:00:00Z"');
    expect(html).toContain("Gift sent");
    expect(html).toContain("Credit purchased");
    expect(html).toContain("−1");
    expect(html).toContain("+1");
    expect(html).toContain("One credit removed");
    expect(html).toContain("One credit added");
    expect(html).toContain("Page 1 of 2");
  });

  it("keeps empty, loading and retry states distinct", () => {
    const history = { page: 1, last_page: 1, items: [] };
    expect(renderHistory({ history })).toContain(copy.historyEmpty);
    expect(renderHistory({ history, loading: true })).toContain(copy.historyLoading);
    const error = renderHistory({ history, failed: true });
    expect(error).toContain(copy.historyFailed);
    expect(error).toContain(copy.retry);
    expect(error).not.toContain(copy.historyEmpty);
  });
});
