import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ar from "../../../messages/ar.json";
import en from "../../../messages/en.json";
import ku from "../../../messages/ku.json";
import { VerificationBadge } from "./verification-badge";

const messages = { ar, en, ku };

describe("verification badge tooltip", () => {
  it.each(["en", "ar", "ku"] as const)("uses a localized, focusable trigger without inline text in %s", (locale) => {
    const label = messages[locale].account.dashboard.overview.verificationBadge.both;
    const markup = renderToStaticMarkup(
      <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="UTC">
        <VerificationBadge kind="both" />
      </NextIntlClientProvider>,
    );

    expect(markup).toContain(`<button type="button" aria-label="${label}"`);
    expect(markup).toContain('fill="#087443"');
    expect(markup).not.toContain(`>${label}<`);
  });

  it("renders no badge for unverified or unavailable public status", () => {
    const markup = renderToStaticMarkup(
      <NextIntlClientProvider locale="en" messages={en} timeZone="UTC">
        <VerificationBadge kind={null} />
        <VerificationBadge />
      </NextIntlClientProvider>,
    );

    expect(markup).toBe("");
  });
});
