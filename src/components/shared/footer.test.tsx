import { FACEBOOK_URL, GOOGLE_PLAY_URL, INSTAGRAM_URL, X_URL } from "@/lib/constants/misc";
import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ar from "../../../messages/ar.json";
import en from "../../../messages/en.json";
import ku from "../../../messages/ku.json";

vi.mock("./themed-logo", () => ({ default: () => <span>Brand mark</span> }));
vi.mock("./status-badge", () => ({ default: () => <span data-testid="service-status">Service status</span> }));
vi.mock("./theme-switcher", () => ({ default: () => <button type="button">Theme</button> }));

import Footer from "./footer";

const messages = { en, ar, ku };
type Locale = keyof typeof messages;
function render(locale: Locale) {
  return renderToStaticMarkup(
    <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="UTC">
      <Footer />
    </NextIntlClientProvider>,
  );
}
function group(markup: string, key: string) {
  return markup.split(`<nav aria-labelledby="footer-${key}"`)[1]?.split("</nav>")[0];
}
function hrefs(markup: string) {
  return [...markup.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
}
const escapeHtml = (text: string) => text.replaceAll("&", "&amp;");

describe.each(["en", "ar", "ku"] as const)("footer navigation in %s", (locale) => {
  it("groups all ten existing destinations into three clearly named sections", () => {
    const markup = render(locale);
    expect(hrefs(group(markup, "explore"))).toEqual([
      `/${locale}/census`,
      `/${locale}/polls`,
      `/${locale}/feature-requests`,
    ]);
    expect(hrefs(group(markup, "support"))).toEqual([
      `/${locale}/faq`,
      "mailto:info@e-syrians.com",
      `/${locale}/donate`,
    ]);
    expect(hrefs(group(markup, "privacy"))).toEqual([
      `/${locale}/privacy-policy`,
      `/${locale}/terms`,
      `/${locale}/child-safety`,
      `/${locale}/delete-account`,
    ]);
    for (const [key, title] of [
      ["explore", messages[locale].footer.explore],
      ["support", messages[locale].footer.support],
      ["privacy", messages[locale].footer.privacy_safety],
    ]) {
      expect(group(markup, key)).toContain(`id="footer-${key}"`);
      expect(group(markup, key)).toContain(escapeHtml(title));
    }
    expect(group(markup, "explore")).toContain(messages[locale].header.nav.features);
    expect(markup).not.toContain(`>${messages[locale].footer.links}</h`);
  });

  it("shows a live Android download link and a non-clickable iOS coming-soon note", () => {
    const markup = render(locale);
    expect(markup).toContain(`href="${GOOGLE_PLAY_URL}"`);
    expect(markup).toContain(messages[locale].footer.apps.google_play);
    expect(markup).toMatch(new RegExp(`<p[^>]*>${messages[locale].footer.apps.ios_coming_soon}</p>`));
    expect(markup).not.toContain("apps.apple.com");
    expect(markup).not.toContain("appstoreconnect.apple.com");
  });

  it("aligns columns to the logical end on desktop without changing the mobile grid or text alignment", () => {
    const markup = render(locale);
    expect(markup).toMatch(/class="[^"]*grid-cols-2[^"]*sm:grid-cols-3[^"]*lg:justify-items-end/);
    for (const key of ["explore", "support", "privacy"]) {
      expect(group(markup, key)).not.toMatch(/text-(left|right|end)/);
    }
  });

  it("keeps every social link, service status, and theme control", () => {
    const markup = render(locale);
    for (const url of [INSTAGRAM_URL, X_URL, FACEBOOK_URL]) {
      expect(markup).toContain(`href="${url}" target="_blank" rel="noopener noreferrer"`);
    }
    expect(markup).toContain(`aria-label="${messages[locale].footer.social_media}"`);
    expect(markup).toContain('data-testid="service-status"');
    expect(markup).toContain(">Theme</button>");
  });
});
