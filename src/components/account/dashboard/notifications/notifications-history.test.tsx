import type { AppNotification } from "@/lib/types/account";
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
vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    expect(namespace).toBe("notificationEvents");
    return (key: string) => {
      const [event, field] = key.split(".") as [keyof typeof en.notificationEvents, "title" | "body"];
      return messages[state.locale].notificationEvents[event][field];
    };
  },
}));

const events = ["identity_credit_granted", "identity_credit_gifted"] as const;
function itemFor(event: (typeof events)[number]): AppNotification {
  return {
    id: "test-notification",
    type: "App\\Notifications\\PlatformNotification",
    data: {
      type: "identity-verification",
      title_key: `notificationEvents.${event}.title`,
      title: "Fallback title",
      body: "Fallback body",
      subject_id: "https://untrusted.test/",
      url: "https://untrusted.test/",
    },
    read_at: null,
    created_at: "2026-11-12T00:00:00Z",
  };
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
      const html = renderToStaticMarkup(<NotificationHistoryContent item={itemFor(event)} onOpen={() => {}} />);
      expect(html).toContain(`href="/${locale}/account/identity-sandbox"`);
      expect(html).toContain(messages[locale].notificationEvents[event].title);
      expect(html).toContain(messages[locale].notificationEvents[event].body);
      expect(html).not.toContain("untrusted.test");
    }
  });

  it("does not link to a disabled sandbox", () => {
    vi.stubEnv("NEXT_PUBLIC_IDENTITY_SANDBOX_ENABLED", "false");
    const html = renderToStaticMarkup(
      <NotificationHistoryContent item={itemFor("identity_credit_granted")} onOpen={() => {}} />,
    );
    expect(html).not.toContain("href=");
    expect(html).toContain(en.notificationEvents.identity_credit_granted.title);
  });

  it("preserves legacy messages and does not change their destinations", () => {
    vi.stubEnv("NEXT_PUBLIC_IDENTITY_SANDBOX_ENABLED", "true");
    const item = { ...itemFor("identity_credit_gifted"), data: { message: "Legacy message" } };
    const html = renderToStaticMarkup(<NotificationHistoryContent item={item} onOpen={() => {}} />);
    expect(html).toContain("Legacy message");
    expect(html).not.toContain("href=");
  });
});
