import { NextIntlClientProvider } from "next-intl";
import { createElement, type ComponentType, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ar from "../../../messages/ar.json";
import en from "../../../messages/en.json";
import ku from "../../../messages/ku.json";
import sitemap from "../../app/sitemap";
import AccountDeletion from "./account-deletion";
import ChildSafety from "./child-safety";
import PrivacyPolicy from "./privacy-policy";
import Terms from "./terms";

// Next's router boundary is unavailable in the Node-only SSR test environment.
vi.mock("@/i18n/routing", async () => {
  const { useLocale } = await import("next-intl");
  return {
    Link: ({ href, children, ...props }: { href: string; children: ReactNode; className?: string }) =>
      createElement("a", { ...props, href: `/${useLocale()}${href}` }, children),
  };
});

describe("public account deletion", () => {
  it.each(["en", "ar", "ku"] as const)("offers both request routes in %s without a session", (locale) => {
    const html = render(locale, AccountDeletion);

    expect(html).toContain(messages[locale].accountDeletionPublic.title);
    expect(html).toContain('href="mailto:info@e-syrians.com?subject=');
    expect(html).toContain(`href="/${locale}/account/settings/security"`);
    expect(html).toContain(`href="/${locale}/privacy-policy"`);
    expect(html).toContain("15");
    expect(render(locale, PrivacyPolicy)).toContain(`href="/${locale}/delete-account"`);
  });

  it("includes the English and Arabic public URLs in the sitemap", () => {
    const page = sitemap().find((entry) => entry.url.endsWith("/en/delete-account"));
    expect(page?.alternates?.languages).toEqual({
      ar: "https://www.e-syrians.com/ar/delete-account",
      en: "https://www.e-syrians.com/en/delete-account",
    });
  });
});

const messages = { ar, en, ku };

function render(locale: keyof typeof messages, Component: ComponentType = ChildSafety) {
  return renderToStaticMarkup(
    <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="UTC">
      <Component />
    </NextIntlClientProvider>,
  );
}

describe("child safety standards", () => {
  it.each(["en", "ar", "ku"] as const)("renders the complete public policy in %s", (locale) => {
    const html = render(locale);

    expect(html).toContain(messages[locale].childSafety.title);
    expect(html).toContain('href="mailto:info@e-syrians.com"');
    expect(html).toContain("NCMEC");
    expect(html).toMatch(/datetime="2026-11-03"/i);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html.match(/<h2\b/g)).toHaveLength(7);
    for (const section of ["scope", "prohibited", "reporting", "response", "privacy", "emergency", "contact"]) {
      expect(html).toContain(`href="#${section}"`);
      expect(html).toContain(`id="${section}"`);
    }
    expect(html).not.toContain("childSafety.");
    expect(html).not.toContain("MISSING_MESSAGE");
  });

  it.each(["en", "ar"] as const)("keeps related-policy links in the %s locale", (locale) => {
    const html = render(locale);
    expect(html).toContain(`href="/${locale}/privacy-policy"`);
    expect(html).toContain(`href="/${locale}/terms"`);
    expect(render(locale, PrivacyPolicy)).toContain(`href="/${locale}/child-safety"`);
    expect(render(locale, Terms)).toContain(`href="/${locale}/child-safety"`);
  });

  it("uses Arabic direction and marks the Kurdish fallback as English", () => {
    expect(render("ar")).toContain('<article lang="ar" dir="rtl"');
    expect(render("en")).toContain('<article lang="en" dir="ltr"');
    expect(render("ku")).toContain('<article lang="en" dir="ltr"');
    expect(render("ku")).toContain(en.childSafety.fallbackNotice);
    expect(ku.childSafety).toEqual(en.childSafety);
  });

  it("includes the published language URLs in the sitemap", () => {
    const page = sitemap().find((entry) => entry.url.endsWith("/en/child-safety"));
    expect(page?.alternates?.languages).toEqual({
      ar: "https://www.e-syrians.com/ar/child-safety",
      en: "https://www.e-syrians.com/en/child-safety",
    });
  });

  it.each(["en", "ar", "ku"] as const)("renders the Sign in with Apple disclosure in %s", (locale) => {
    const html = render(locale, PrivacyPolicy);
    expect(html).toContain('id="sign-in-with-apple"');
    expect(html).toContain(messages[locale].privacyPolicy.appleSignIn.title);
    expect(html).toContain('href="https://www.apple.com/legal/privacy/data/en/sign-in-with-apple/"');
  });
});
