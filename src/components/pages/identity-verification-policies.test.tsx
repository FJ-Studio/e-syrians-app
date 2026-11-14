import { verificationCopy } from "@/lib/identity-verification";
import { NextIntlClientProvider } from "next-intl";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ar from "../../../messages/ar.json";
import en from "../../../messages/en.json";
import ku from "../../../messages/ku.json";
import VerificationCheckout from "../account/dashboard/verifications/verification-checkout";
import PrivacyPolicy from "./privacy-policy";
import Terms from "./terms";

vi.mock("@/i18n/routing", async () => {
  const { useLocale } = await import("next-intl");
  return {
    Link: ({ href, children, ...props }: { href: string; children: ReactNode; className?: string }) =>
      createElement("a", { ...props, href: `/${useLocale()}${href}` }, children),
  };
});
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock("@/hooks/use-identity-verification", () => ({ requestVerification: vi.fn() }));

const messages = { ar, en, ku };

function render(locale: keyof typeof messages, children: ReactNode) {
  return renderToStaticMarkup(
    <NextIntlClientProvider
      locale={locale}
      messages={messages[locale]}
      timeZone="UTC"
      onError={(error) => {
        throw error;
      }}
    >
      {children}
    </NextIntlClientProvider>,
  );
}

describe("ID verification policies", () => {
  it.each(["en", "ar", "ku"] as const)("renders the provider disclosures and refund instructions in %s", (locale) => {
    const privacy = render(locale, <PrivacyPolicy />);
    const terms = render(locale, <Terms />);
    const localized = messages[locale];

    expect(privacy).toContain('id="identity-verification"');
    expect(privacy).toContain(localized.privacyPolicy.identityVerification.title);
    expect(privacy).toContain('href="https://help.didit.me/end-users/your-data"');
    expect(privacy).toContain('href="https://stripe.com/privacy"');
    expect(privacy).toContain('href="mailto:info@e-syrians.com"');
    expect(terms).toContain('id="identity-verification-purchases"');
    expect(terms).toContain(localized.terms.identityVerification.refundTitle);
    expect(terms).toContain(`href="/${locale}/privacy-policy#identity-verification"`);
    expect(terms).toContain('href="mailto:info@e-syrians.com"');
  });

  it.each(["en", "ar", "ku"] as const)("links to the %s purchase terms before the buy button", (locale) => {
    const html = render(
      locale,
      <VerificationCheckout
        summary={{
          can_purchase: true,
          price_minor: 300,
          currency: "eur",
          provider_ready: true,
          can_claim: false,
          credits: [],
        }}
        copy={verificationCopy(locale, true)}
        userId="test-user"
        onPaid={vi.fn()}
      />,
    );

    expect(html).toContain(messages[locale].terms.identityVerification.purchaseLink);
    expect(html).toMatch(new RegExp(`href="/${locale}/terms#identity-verification-purchases"[\\s\\S]*<button`));
  });
});
