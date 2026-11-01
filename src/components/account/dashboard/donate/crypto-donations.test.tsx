import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import CryptoDonations from "./crypto-donations";

vi.mock("@/lib/fonts/fonts", () => ({ ibm: { className: "test-font" } }));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));

describe("crypto donation section", () => {
  it("renders nothing when disabled or no wallets are configured", () => {
    expect(renderToStaticMarkup(createElement(CryptoDonations, { wallets: [] }))).toBe("");
  });

  it("renders admin-managed currencies networks and exact copyable addresses", () => {
    const html = renderToStaticMarkup(
      createElement(CryptoDonations, {
        wallets: [
          { name: "Litecoin", currency: "LTC", network: null, address: "ltc1qtestaddress" },
          { name: "Tether", currency: "USDT", network: "TRC-20", address: "TRontestaddress" },
        ],
      }),
    );

    expect(html).toContain("Litecoin");
    expect(html).toContain("LTC");
    expect(html).toContain("ltc1qtestaddress");
    expect(html).toContain("TRC-20");
    expect(html).toContain("TRontestaddress");
    expect(html).toContain('dir="ltr"');
    expect(html).not.toContain("1MA6NKkSCKAocZR8ZeETD5ewf48heC83pq");
  });
});
