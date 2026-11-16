import type { AppNotification } from "@/lib/types/account";
import { NextIntlClientProvider } from "next-intl";
import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import ar from "../../../../../messages/ar.json";
import en from "../../../../../messages/en.json";
import ku from "../../../../../messages/ku.json";
import { NotificationHistoryContent } from "./notifications-history";

const state = vi.hoisted(() => ({ locale: "en" as "en" | "ar" | "ku" }));
const messages = { en, ar, ku };
vi.mock("@/i18n/routing", () => ({
  Link: ({ href, ...props }: ComponentProps<"a">) => <a {...props} href={`/${state.locale}${href}`} />,
}));

const events = ["identity_credit_granted", "identity_credit_gifted"] as const;
function itemFor(event: string, type = "identity-verification"): AppNotification {
  return {
    id: "test-notification",
    type: "App\\Notifications\\PlatformNotification",
    data: {
      type,
      title_key: `notificationEvents.${event}.title`,
      body_key: `notificationEvents.${event}.body`,
      title: "Fallback title",
      body: "Fallback body",
      subject_id: "https://untrusted.test/",
      url: "https://untrusted.test/",
    },
    read_at: null,
    created_at: "2026-11-12T00:00:00Z",
  };
}

function renderNotice(item: AppNotification) {
  return renderToStaticMarkup(
    <NextIntlClientProvider
      locale={state.locale}
      messages={messages[state.locale]}
      timeZone="UTC"
      onError={(error) => {
        throw error;
      }}
    >
      <NotificationHistoryContent item={item} onOpen={() => {}} />
    </NextIntlClientProvider>,
  );
}

afterEach(() => {
  vi.unstubAllEnvs();
  state.locale = "en";
});

describe("ID verification credit notices", () => {
  it.each(events)("links %s to ID verification in each locale, ignoring payload URLs", (event) => {
    vi.stubEnv("NEXT_PUBLIC_IDENTITY_SANDBOX_ENABLED", "true");
    for (const locale of ["en", "ar", "ku"] as const) {
      state.locale = locale;
      const html = renderNotice(itemFor(event));
      expect(html).toContain(`href="/${locale}/account/identity-sandbox"`);
      expect(html).toContain(messages[locale].notificationEvents[event].title);
      expect(html).toContain(messages[locale].notificationEvents[event].body);
      expect(html).not.toContain("untrusted.test");
    }
  });

  it("does not link to a disabled sandbox", () => {
    vi.stubEnv("NEXT_PUBLIC_IDENTITY_SANDBOX_ENABLED", "false");
    const html = renderNotice(itemFor("identity_credit_granted"));
    expect(html).not.toContain("href=");
    expect(html).toContain(en.notificationEvents.identity_credit_granted.title);
  });

  it("preserves legacy messages and does not change their destinations", () => {
    vi.stubEnv("NEXT_PUBLIC_IDENTITY_SANDBOX_ENABLED", "true");
    const item = { ...itemFor("identity_credit_gifted"), data: { message: "Legacy message" } };
    const html = renderNotice(item);
    expect(html).toContain("Legacy message");
    expect(html).not.toContain("href=");
  });
});

describe("event-specific notification history", () => {
  const platformEvents = [
    ["verification_received", "verification"],
    ["verification_revoked", "verification"],
    ["account_verified", "verification"],
    ["account_unverified", "verification"],
    ["poll_opened", "poll-audience"],
    ["poll_closed", "poll-results"],
    ["feature_idea", "feature-request-status"],
    ["feature_in_development", "feature-request-status"],
    ["feature_in_testing", "feature-request-status"],
    ["feature_shipped", "feature-request-status"],
    ["security_new_signin", "security-signin"],
    ["security_password_changed", "security-event"],
    ["security_password_set", "security-event"],
    ["security_two_factor_enabled", "security-2fa"],
    ["security_two_factor_disabled", "security-2fa"],
  ] as const;

  it.each(platformEvents)("shows localized title and body for %s in all three languages", (event, type) => {
    const item = itemFor(event, type);
    item.data.title = "E-Syrians";
    item.data.body = "You have a new update in E-Syrians.";
    for (const locale of ["en", "ar", "ku"] as const) {
      state.locale = locale;
      const html = renderNotice(item);
      expect(html).toContain(messages[locale].notificationEvents[event].title);
      expect(html).toContain(messages[locale].notificationEvents[event].body);
      expect(html).not.toContain(item.data.body);
    }
  });

  it("preserves announcement copy even when a translation key matches", () => {
    const html = renderNotice(itemFor("poll_closed", "announcement"));
    expect(html).toContain("Fallback title");
    expect(html).toContain("Fallback body");
    expect(html).not.toContain(en.notificationEvents.poll_closed.title);
  });

  it("falls back to stored copy for unknown event keys", () => {
    const html = renderNotice(itemFor("future_event", "notification"));
    expect(html).toContain("Fallback title");
    expect(html).toContain("Fallback body");
  });

  it("translates available fields independently and ignores a key outside the event namespace", () => {
    const item = itemFor("poll_closed", "poll-results");
    item.data.body_key = "notificationPreferences.categories.poll_results.body";
    const html = renderNotice(item);
    expect(html).toContain(en.notificationEvents.poll_closed.title);
    expect(html).toContain("Fallback body");
    expect(html).not.toContain(en.notificationPreferences.categories.poll_results.body);
  });
});
